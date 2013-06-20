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
        var self = this,
            deferred = Q.defer(),
            id = this._id++;

        this._files[id] = {
            name: fileName,
            size: fileSize,
            uploaded: 0
        };

        setTimeout(function () {
            deferred.resolve(id);
        }, 0);

        return deferred.promise;
    };

    TestTransport.prototype.send = function (fileId, chunk, start, end) {
        var self = this,
            file = this._files[fileId],
            deferred = Q.defer();

        this._concurrentSends++;

        setTimeout(function () {
            file.uploaded += chunk.size;

            self._maxConcurrentSends = Math.max(self._concurrentSends, self._maxConcurrentSends);
            self._concurrentSends--;

            if (file.size === file.uploaded) {
                deferred.resolve('complete');
            } else {
                deferred.resolve('incomplete');
            }
        }, 0);

        return deferred.promise;
    };
})(window.TestUtils = window.TestUtils || {});
