'use strict';

(function (TestUtils) {
    function TestTransport () {
        this._id = 0;
        this._files = {};
        this._maxConcurrentSends = 0;
        this._concurrentSends = 0;
    }

    TestUtils.TestTransport = TestTransport;

    TestTransport.prototype = Object.create(UploadJS.Transport);

    TestTransport.prototype.initiateUpload = function (fileName, fileSize) {
        var id = this._id++;

        this._files[id] = {
            name: fileName,
            size: fileSize,
            uploaded: 0
        };

        return Q.fcall(function () {
            return id;
        });
    };

    TestTransport.prototype.send = function (fileId, chunk, start, end) {
        var self = this,
            file = this._files[fileId];

        this._concurrentSends++;

        return Q.fcall(function () {
            file.uploaded += chunk.size;

            self._maxConcurrentSends = Math.max(self._concurrentSends, self._maxConcurrentSends);
            self._concurrentSends--;

            return file.uploaded;
        });
    };
})(window.TestUtils = window.TestUtils || {});
