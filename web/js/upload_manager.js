'use strict';

(function (UploadJS, undefined) {

    var CHUNK_SIZE = 1024 * 1024; //bytes

    /**
     * Uploads one or more files to the specified endpoint. It can upload files of any size by
     * sending the files in chuncks. The upload can be interrupted at any time without having
     * to send the entire file again.
     *
     * @name UploadManager
     * @constructor
     *
     * @param {String} endpoint
     * @param {File[]} files
     */
    function UploadManager(endpoint, files) {
        this._endpoint = endpoint;
        this._files = files;
    };

    UploadManager.prototype.startUpload = function () {

    };

    UploadManager.prototype.pause = function () {

    };

    UploadManager.prototype.resume = function () {

    };

    UploadManager.prototype.cancel = function () {

    };

    UploadJS.UploadManager = UploadManager;

}(window.UploadJS = window.UploadJS || {}));