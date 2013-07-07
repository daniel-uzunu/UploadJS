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
