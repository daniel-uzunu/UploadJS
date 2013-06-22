'use strict';

(function (UploadJS) {
    /**
     * Manages file uploads.
     * @constructor
     *
     * @param {Transport} transport the transport used to upload files
     * @param {Object} [options] the options used to instantiate the upload manager
     */
    function UploadManager(transport, options) {
        this._queue = [];
        this._transport = transport;
        this._chunkSize = options.chunkSize || 102400;
        this._nextId = 0;
        this._isUploading = false;
    }

    UploadJS.UploadManager = UploadManager;

    UploadManager.prototype = Object.create(EventEmitter.prototype);

    /**
     * Adds a file to the list of files to be uploaded.
     *
     * @param {File} file the file to be uploaded
     * @returns {String} the id associated with the current file
     * @throws {Error} when no file was specified
     */
    UploadManager.prototype.upload = function (file) {
        if (!file) {
            throw new Error('No argument was passed.');
        }

        this._queue.push(file);

        if (!this._isUploading) {
            this._uploadQueuedFiles();
        }

        return 'file' + this._nextId++;
    };

    /**
     * Uploads all the files in the queue.
     * @private
     */
    UploadManager.prototype._uploadQueuedFiles = function () {
        var self = this,
            file = self._queue.shift();

        this._isUploading = true;

        Q.fcall(function () {
            self.emit('started', file);
            return self._transport.initiateUpload(file.name, file.size);
        }).then(function (id) {
            var promise = Q.resolve();

            for (var start = 0, size = file.size; start < size; start += self._chunkSize) {
                promise = promise
                    .then(self._sendChunk.bind(self, id, file, start))
                    .then(function (bytesSent) {
                        self.emit('progress', file, bytesSent);
                    });
            }

            return promise;
        }).then(function () {
            self.emit('finished', file);
        }).fail(function (error) {
            if (self.getListeners('error').length > 0) {
                self.emit('error', file, error);
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
