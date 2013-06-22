'use strict';

(function (UploadJS) {
    /**
     * Manages file uploads. The files are sent to the server in chunks using the specified transport.
     * All the events receive the unique id associated with the file as the first parameter. An unique id is sent
     * because more files can have the same name. This id is a valid identifier, meaning that it is safe to use
     * it as the id of a DOM element.
     *
     * The following events are emitted:
     * - started: indicates that the upload for the file was started;
     * - progress: indicates the current number of bytes that were successfully sent. It is guaranteed that a progress
     *   event is sent after each chunk is sent to the server;
     * - finished: emitted after a successful upload;
     * - error: an error occurred while the file was uploading. If no event handler is registered the error is thrown.
     *
     * @example
     *
     *      var manager = new Manager(new XhrTransport(), {chunkSize: 1024});
     *
     *      manager.on('started', function (fileId) {});
     *      manager.on('progress', function (fileId, bytesSent) {});
     *      manager.on('finished', function (fileId) {});
     *      manager.on('error', function (fileId, error) {});
     *
     *      manager.upload(file);
     *
     * @constructor
     *
     * @param {Transport} transport the transport used to upload files
     * @param {Object} [options] the options used to instantiate the upload manager
     */
    function UploadManager(transport, options) {
        /**
         * The list of file ids of the files waiting to be uploaded.
         * @type {Array}
         */
        this._queue = [];

        /**
         * Key-value map storing the files associated with the files
         * @type {Object}
         */
        this._fileMap = {};

        /**
         * The transport used to send the files to the server.
         * @type {Transport}
         */
        this._transport = transport;

        /**
         * The chunk size in bytes.
         * @type {Number}
         */
        this._chunkSize = options.chunkSize || 102400;

        /**
         * The next id that will be associated with a file.
         * @type {Number}
         */
        this._nextId = 0;

        /**
         * Indicates if a file upload is in progress.
         * @type {Boolean}
         */
        this._isUploading = false;
    }

    UploadJS.UploadManager = UploadManager;

    UploadManager.prototype = Object.create(EventEmitter.prototype);

    /**
     * Adds a file to the queue of files to be uploaded.
     *
     * @param {File} file the file to be uploaded
     * @returns {String} the id associated with the file
     * @throws {Error} when no file was specified
     */
    UploadManager.prototype.upload = function (file) {
        if (!file) {
            throw new Error('No argument was passed.');
        }

        var id = 'file' + this._nextId++;
        this._fileMap[id] = file;
        this._queue.push(id);

        if (!this._isUploading) {
            this._uploadQueuedFiles();
        }

        return id;
    };

    /**
     * Uploads all the files in the queue.
     * @private
     */
    UploadManager.prototype._uploadQueuedFiles = function () {
        var self = this,
            id = this._queue.shift(),
            file = this._fileMap[id];

        this._isUploading = true;

        Q.fcall(function () {
            self.emit('started', id);
            return self._transport.initiateUpload(file.name, file.size);
        }).then(function (serverId) {
            var promise = Q.resolve();

            for (var start = 0, size = file.size; start < size; start += self._chunkSize) {
                promise = promise
                    .then(self._sendChunk.bind(self, serverId, file, start))
                    .then(function (bytesSent) {
                        self.emit('progress', id, bytesSent);
                    });
            }

            return promise;
        }).then(function () {
            self.emit('finished', id);
        }).fail(function (error) {
            if (self.getListeners('error').length > 0) {
                self.emit('error', id, error);
            } else {
                throw error;
            }
        }).fin(function () {
            if (self._queue.length > 0) {
                self._uploadQueuedFiles();
            } else {
                self._isUploading = false;
            }
        }).done();
    };

    /**
     * Sends a file chunk starting at the specified index.
     * @param {String|Number} fileId the unique identifier generated for this upload
     * @param {File} file
     * @param {Number} start
     * @returns {Promise} the number of bytes sent until now
     * @private
     */
    UploadManager.prototype._sendChunk = function (fileId, file, start) {
        var chunk = file.slice(start, start + this._chunkSize);
        return this._transport.send(fileId, chunk, start, start + this._chunkSize);
    };
})(window.UploadJS = window.UploadJS || {});
