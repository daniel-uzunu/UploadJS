'use strict';

(function (UploadJS, undefined) {

    var CHUNK_SIZE = 1048576; // 1 MB in bytes

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

        // I should add progress and finish events
    };

    /**
     * Starts the upload.
     */
    UploadManager.prototype.startUpload = function () {
        var xhr = new XMLHttpRequest();

        xhr.addEventListener('load', function (e) {
            console.log(e);
            console.log(xhr.status);
            console.log(xhr.responseText);
        });

        xhr.open('POST', '/upload');
        xhr.setRequestHeader('content-type', 'application/json');
        xhr.setRequestHeader('accept', 'application/json');
        xhr.send(JSON.stringify({type: 'image/png', length: 5000, title: 'myimage.png'}));

        return;
        for (var i = 0, l = this._files.length; i < l; i++) {
            this._readFileAndSend(this._files[i])
            .then(function () {
                console.log('success');
            }, function (e) {
                console.log('error: ', e);
            });
        }
    };

    /**
     * Reads a file and sends it to the server in chunks. Recursively calls itself with from being
     * the position from where to read the next chunck.
     *
     * @param {File} file the file to send to the server.
     * @param {Number} [from] the position from which to read the next chunck.
     *
     * @returns {Promise} indicates when the upload finished.
     */
    UploadManager.prototype._readFileAndSend = function (file, from) {
        console.log('read file: ', from, file.size);
        var self = this;

        if (from === undefined) {
            from = 0;
        }

        if (from < file.size) {
            return Q.fcall(function () {
                // the data can also be read into an ArrayBuffer using a FileReader, but it is
                // easier and more efficient to directly pass the blob representing the file chunk.
                var chunk = file.slice(from, from + CHUNK_SIZE),
                    deferred = Q.defer();

                var xhr = new XMLHttpRequest();

                xhr.addEventListener('load', function (e) {
                    console.log(e);
                    console.log(xhr.status);
                    deferred.resolve();
                });

                xhr.open('POST', '/upload');
                xhr.send(chunk);

                return deferred.promise;
            })
            .then(function () {
                return self._readFileAndSend(file, from + CHUNK_SIZE);
            });
        }

        return;
    };

    /**
     * Reads a file chunk.
     *
     * @param {Blob} fileChunk the part of the file to read
     *
     * @return {Promise}
     */
    UploadManager.prototype._readFileChunk = function (fileChunk) {
        var deferred = Q.defer();
        var reader = new FileReader();

        reader.addEventListener('load', function (e) {
            deferred.resolve(e.target.result);
        });

        reader.addEventListener('error', function (e) {
            deferred.reject(e);
        });

        // this can throw an error which is handled by the Q library by calling the reject callback
        reader.readAsArrayBuffer(fileChunk);

        return deferred.promise;
    };

    UploadManager.prototype.pause = function () {

    };

    UploadManager.prototype.resume = function () {

    };

    /**
     * @param {Number} [index] if this parameter is present cancels the upload for the file at the specified index, else cancels all
     */
    UploadManager.prototype.cancel = function (index) {

    };

    // maybe I'll use these methods to dynamically add or remove files to/from the queue
    UploadManager.prototype.addFile = function () { };
    UploadManager.prototype.removeFile = function () { };

    UploadJS.UploadManager = UploadManager;

}(window.UploadJS = window.UploadJS || {}));
