'use strict';

describe('XHR transport', function () {
    var XhrTransport = UploadJS.XhrTransport,
        uploadUrl = '/upload',
        xhr,
        requests;

    beforeEach(function () {
        requests = [];
        xhr = sinon.useFakeXMLHttpRequest();
        xhr.onCreate = function (request) {
            requests.push(request);
        };
    });

    afterEach(function () {
        xhr.restore();
    });

    describe('initiating a resumable upload request', function () {
        it('should POST the file info to the upload URL', function () {
            var transport = new XhrTransport(uploadUrl);

            transport.initiateUpload('1.txt', 100);

            expect(requests).to.have.length(1);
            expect(requests[0].url).to.equal(uploadUrl);
            expect(requests[0].method).to.equal('POST');
            expect(requests[0].requestHeaders['Content-Type']).to.equal('application/json;charset=utf-8');
            expect(requests[0].requestHeaders['Accept']).to.equal('application/json;charset=utf-8');
            expect(JSON.parse(requests[0].requestBody)).to.eql({name: '1.txt', size: 100});
        });

        it('should resolve the returned promise with the server generated url', function (done) {
            var transport = new XhrTransport(uploadUrl);

            transport.initiateUpload('1.txt', 100).then(function (url) {
                expect(url).to.equal('/upload/2');
                done();
            }).done();

            Q.fcall(function () {
                requests[0].respond(200, {'Content-Type': 'application/json'}, JSON.stringify({url: '/upload/2'}));
            });
        });
    });

    describe('sending a file chunk', function () {
        var transport, fileId, blob, blobData;

        beforeEach(function (done) {
            transport = new XhrTransport(uploadUrl);
            blobData = 'some data';
            blob = new Blob([blobData]);

            transport.initiateUpload('1.txt', 100).then(function (url) {
                fileId = url;
                done();
            }).done();

            Q.fcall(function () {
                requests[0].respond(200, {'Content-Type': 'application/json'}, JSON.stringify({url: '/upload/2'}));
            });
        });

        it('should send a blob to the server', function (done) {
            transport.send(fileId, blob, 0, blob.size);

            expect(requests).to.have.length(2);
            expect(requests[1].url).to.equal(fileId);
            expect(requests[1].method).to.equal('PUT');

            var reader = new FileReader();
            reader.addEventListener('loadend', function () {
                expect(reader.result).to.equal(blobData);
                done();
            });
            reader.readAsText(requests[1].requestBody);
        });

        it('should set the Content-Range header', function () {
            transport.send(fileId, blob, 0, blob.size);
            expect(requests[1].requestHeaders['Content-Range']).to.equal('0-8/100');
        });

        it('should resolve the returned promise with the number of bytes sent', function (done) {
            transport.send(fileId, blob, 0, blob.size).then(function (bytesSent) {
                expect(bytesSent).to.equal(9);
                done();
            });

            Q.fcall(function () {
                requests[1].respond(308, {'Range': 'bytes=0-8', 'Content-Length': 0});
            }).done();
        });

        it('should throw an error when the file id is invalid', function () {
            expect(function () {
                transport.send('invalid', blob, 0, blob.size);
            }).to.throwError();
        });
    });
});
