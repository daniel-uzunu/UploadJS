// Copyright (c) 2012-2013 Daniel Uzunu
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

'use strict';

(function (UploadJS) {
    /**
     * Transport implementation that uses XMLHttpRequest to send the file content to the server.
     *
     * @param {String} uploadUrl
     * @constructor
     */
    function XhrTransport (uploadUrl) {
        this._uploadUrl = uploadUrl;
        this._files = {};
    }

    UploadJS.XhrTransport = XhrTransport;

    XhrTransport.prototype = Object.create(UploadJS.Transport.prototype);

    /**
     * Posts the file details to the servers and resolves the returned promise with the upload url received from
     * the server.
     *
     * @param {String} fileName
     * @param {Number} fileSize
     * @returns {Q.promise}
     */
    XhrTransport.prototype.initiateUpload = function (fileName, fileSize) {
        var deferred = Q.defer(),
            self = this;

        var req = new XMLHttpRequest();
        req.addEventListener('load', function () {
            var res = JSON.parse(req.responseText);
            self._files[res.url] = {
                name: fileName,
                size: fileSize
            };
            deferred.resolve(res.url);
        });

        req.open('POST', this._uploadUrl, true);
        req.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
        req.setRequestHeader('Accept', 'application/json;charset=utf-8');
        req.send(JSON.stringify({
            name: fileName,
            size: fileSize
        }));

        return deferred.promise;
    };

    /**
     * Sends a file chunk to the server.
     *
     * The Content-Range header is used to indicate the part of the file which is uploaded in the current request.
     * Usually this header is used as a response header, but it can also be used for requests when the request has a
     * body. See http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.16 for more details.
     *
     * The server uses the Range header to indicate the range/ranges that where uploaded until now.
     * See http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.35.
     *
     * Sample requests and responses used to upload a file:
     *
     *      PUT /upload/234 HTTP/1.1
     *      Content-Range: bytes 0-499/1000
     *      Content-Type: application/octet-stream
     *      Content-Length: 500
     *
     *      <bytes 0-499>
     *
     *      HTTP/1.1 200 OK
     *      Content-Length: 0
     *      Range: bytes=0-499
     *
     *
     *      PUT /upload/234 HTTP/1.1
     *      Content-Range: bytes 500-999/1000
     *      Content-Type: application/octet-stream
     *      Content-Length: 500
     *
     *      <bytes 500-999>
     *
     *      HTTP/1.1 201 Created
     *      Content-Length: 0
     *
     * @param {String} fileId the url at which the file is uploaded
     * @param {Blob} chunk
     * @param {Number} start the first byte
     * @param {Number} end the last byte
     * @returns {Q.promise} the number of bytes uploaded until now
     */
    XhrTransport.prototype.send = function (fileId, chunk, start, end) {
        if (!this._files[fileId]) {
            throw new Error('The specified file id is invalid');
        }

        var deferred = Q.defer();

        var req = new XMLHttpRequest(),
            fileSize = this._files[fileId].size;

        req.addEventListener('load', function () {
            var rangeHeader = req.getResponseHeader('Range');
            rangeHeader = rangeHeader.replace('bytes=', '');

            var parts = rangeHeader.split('-'),
                startPos = parseInt(parts[0], 10),
                endPos = parseInt(parts[1], 10);

            deferred.resolve(endPos - startPos + 1);
        });

        req.open('PUT', fileId, true);
        req.setRequestHeader('Content-Range', 'bytes ' + start + '-' + (end - 1) + '/' + fileSize);
        req.setRequestHeader('Content-Type', 'application/octet-stream');
        req.send(chunk);

        return deferred.promise;
    };
})(window.UploadJS = window.UploadJS || {});
