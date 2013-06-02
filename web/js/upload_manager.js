'use strict';

(function (UploadJS) {
    /**
     * Manages file uploads.
     * @constructor
     */
    function UploadManager() {
        this._files = [];
    }

    UploadJS.UploadManager = UploadManager;

    UploadManager.prototype = Object.create(EventEmitter.prototype);

    /**
     * Adds a file to the list of files to be uploaded.
     * @param {File|Array} file the file(s) to be uploaded
     * @throws {Error} when no file was specified
     */
    UploadManager.prototype.upload = function (file) {
        if (!file) {
            throw new Error('No argument was passed.');
        }

        if (file instanceof Array) {
            this._files = this._files.concat(file);
        } else {
            this._files.push(file);
            this.emit('uploadStarted', file);
        }
    };

    /**
     * Gets all the files handled regardless of their status.
     * @returns {Array} the list of files
     */
    UploadManager.prototype.getAllFiles = function () {
        return this._files;
    };
})(window.UploadJS = window.UploadJS || {});
