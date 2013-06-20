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
        this._files = [];
        this._transport = transport;
        this._chunkSize = options.chunkSize || 102400;
        this._nextId = 0;
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
        var self = this;

        if (!file) {
            throw new Error('No argument was passed.');
        }

        this._files.push(file);
        this.emit('uploadStarted', file);

        Q.fcall(function () {
            return self._transport.initiateUpload(file.name, file.size);
        })
        .then(function (id) {
            var promise = Q.resolve();

            for (var start = 0, size = file.size; start < size; start += self._chunkSize) {
                promise = promise.then(self._sendChunk.bind(self, id, file, start));
            }

            return promise;
        })
        .then(function (status) {
            console.log(status);

            //delayed the emitted event to avoid catching the errors thrown by the event handler in the
            // fail handler
            setTimeout(function () {
                self.emit('uploadFinished', file);
            }, 0);
        })
        .fail(function (error) {
            console.log('fail', error);
        });

        return (this._nextId++).toString();
    };

    /**
     * Sends a file chunk starting at the specified index.
     * @param {String|Number} fileId the unique identifier generated for this upload
     * @param {File} file
     * @param {Number} start
     * @returns {String} the upload status: complete|incomplete
     * @private
     */
    UploadManager.prototype._sendChunk = function (fileId, file, start) {
        var chunk = file.slice(start, start + this._chunkSize);
        return this._transport.send(fileId, chunk, start, start + this._chunkSize);
    };

    /**
     * Gets all the files handled regardless of their status.
     * @returns {Array} the list of files
     */
    UploadManager.prototype.getAllFiles = function () {
        return this._files;
    };
})(window.UploadJS = window.UploadJS || {});
