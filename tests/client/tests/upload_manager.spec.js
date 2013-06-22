'use strict';

describe('Upload Manager', function () {
    var UploadManager, manager, files, transport;

    this.timeout(500);

    beforeEach(function () {
        transport = new TestUtils.TestTransport();

        sinon.spy(transport, 'initiateUpload');
        sinon.spy(transport, 'send');

        UploadManager = UploadJS.UploadManager;
        manager = new UploadManager(transport, {
            chunkSize: 100
        });

        var slice = function () {
            return {size: 100};
        };

        files = [
            {name: '1.txt', size: 300, slice: sinon.spy(slice)},
            {name: '2.png', size: 500, slice: sinon.spy(slice)},
            {name: '3.js', size: 50, slice: sinon.spy(slice)}
        ];
    });

    describe('single file, single connection', function () {
        it('should throw an error when the file is null', function () {
            expect(function () {
                manager.upload(null);
            }).to.throwError();
        });

        it('should throw an error when the file is undefined', function () {
            expect(function () {
                manager.upload();
            }).to.throwError();
        });

        it('should emit the uploadStarted event' , function (done) {
            var callback = sinon.spy();

            var id = manager.upload(files[0]);

            manager.on('started', callback);

            manager.on('finished', function () {
                expect(callback.calledWith(id)).to.equal(true);
                done();
            });
        });

        it('should return an unique id associated with the file', function (done) {
            var counter = 0;

            var id1 = manager.upload(files[0]);
            var id2 = manager.upload(files[1]);

            expect(id1).not.to.equal(id2);

            manager.on('finished', function () {
                counter++;

                if (counter === 2) {
                    done();
                }
            });
        });

        it('should send the chunks using the specified transport', function (done) {
            var file = files[0];

            var id = manager.upload(file);

            manager.on('finished', function (fileId) {
                expect(fileId).to.equal(id);

                expect(transport.initiateUpload.calledWith(file.name, file.size)).to.equal(true);
                var serverId = transport.initiateUpload.firstCall.returnValue.valueOf();

                expect(transport.send.calledWith(serverId, {size: 100}, 0, 100)).to.equal(true);
                expect(transport.send.calledWith(serverId, {size: 100}, 100, 200)).to.equal(true);
                expect(transport.send.calledWith(serverId, {size: 100}, 200, 300)).to.equal(true);
                expect(transport.send.callCount).to.equal(3);

                expect(file.slice.calledWith(0, 100)).to.equal(true);
                expect(file.slice.calledWith(100, 200)).to.equal(true);
                expect(file.slice.calledWith(200, 300)).to.equal(true);
                expect(file.slice.callCount).to.equal(3);

                expect(transport._maxConcurrentSends).to.equal(1);
                done();
            });
        });

        it('should wait for the upload to finish before starting a new upload', function (done) {
            var callback = sinon.spy(),
                counter = 0;

            var id1 = manager.upload(files[0]);
            var id2 = manager.upload(files[1]);

            manager.on('started', callback);

            manager.on('finished', function () {
                if (counter === 0) {
                    expect(callback.calledWith(id1)).to.equal(true);
                    expect(callback.calledWith(id2)).to.equal(false);
                    counter++;
                } else {
                    expect(callback.calledWith(id1)).to.equal(true);
                    done();
                }
            });
        });

        it('should emit progress events after each chunk', function (done) {
            var callback = sinon.spy();

            var id = manager.upload(files[0]);

            manager.on('progress', callback);

            manager.on('finished', function () {
                expect(callback.calledWith(id, 100)).to.equal(true);
                expect(callback.calledWith(id, 200)).to.equal(true);
                expect(callback.calledWith(id, 300)).to.equal(true);
                done();
            });
        });

        it('should emit error events', function (done) {
            transport.send = function () {
                throw new Error('upload failed');
            };

            var id = manager.upload(files[0]);

            manager.on('error', function (fileId, error) {
                expect(fileId).to.equal(id);
                expect(error).to.be.a(Error);
                done();
            });
        });
    });

    describe('single file, multiple connections', function () {});

    describe('multiple files, multiple connections', function () {});
});
