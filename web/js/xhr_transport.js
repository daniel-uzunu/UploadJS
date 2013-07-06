'use strict';

(function (UploadJS) {
    /**
     *
     * @constructor
     */
    function XhrTransport (uploadUrl) {
        this._uploadUrl = uploadUrl;
        this._files = {};
    }

    UploadJS.XhrTransport = XhrTransport;

    XhrTransport.prototype = Object.create(UploadJS.Transport.prototype);

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
        req.setRequestHeader('Content-Range', start + '-' + (end - 1) + '/' + fileSize);
        req.setRequestHeader('Content-Type', 'application/octet-stream');
        req.send(chunk);

        return deferred.promise;
    };
})(window.UploadJS = window.UploadJS || {});
