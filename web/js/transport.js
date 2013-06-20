'use strict';

(function (UploadJS) {
    /**
     * An abstract class used to implement the communication with the server
     */
    function Transport () {

    }

    UploadJS.Transport = Transport;

    /**
     * Communicates with the server specifying that a new file will be uploaded. The server generates an unique id
     * associated with the file.
     *
     * @param {String} fileName the file name
     * @param {Number} fileSize the file size
     * @returns {Promise} a promise that is resolved with the unique id
     */
    Transport.prototype.initiateUpload = function (fileName, fileSize) {};

    /**
     * Sends a file chunk to the server.
     *
     * @param {String} fileId the unique identifier associated with the file
     * @param {Blob} chunk the file chunk to be sent to the server
     * @param {Number} start
     * @param {Number} end
     * @returns {Promise}
     */
    Transport.prototype.send = function (fileId, chunk, start, end) {};
})(window.UploadJS = window.UploadJS || {});
