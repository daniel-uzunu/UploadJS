'use strict';

describe('Upload Manager', function () {
    var UploadManager = UploadJS.UploadManager,
        TestTransport = TestUtils.TestTransport,
        transport;

    this.timeout(500);

    beforeEach(function () {
        transport = new TestTransport();
        sinon.spy(transport, 'initiateUpload');
        sinon.spy(transport, 'send');
    });

    describe('single file, single connection', function () {
        it('should throw an error when the file is null', function () {
            var manager = new UploadManager(transport, {chunkSize: 100});

            expect(function () {
                manager.upload(null);
            }).to.throwError();
        });

        it('should throw an error when the file is undefined', function () {
            var manager = new UploadManager(transport, {chunkSize: 100});

            expect(function () {
                manager.upload();
            }).to.throwError();
        });

        it('should emit the start event' , function (done) {
            var manager = new UploadManager(transport, {chunkSize: 100}),
                file = new File('1.txt', 50),
                callback = sinon.spy();

            var id = manager.upload(file);
            manager.on('start', callback);

            manager.on('complete', function () {
                expect(callback.calledWith(id)).to.equal(true);
                done();
            });
        });

        it('should emit the complete event' , function (done) {
            var manager = new UploadManager(transport, {chunkSize: 100}),
                file = new File('1.txt', 50),
                callback = sinon.spy();

            var id = manager.upload(file);

            manager.on('complete', function (fileId) {
                expect(fileId).to.equal(id);
                done();
            });
        });

        it('should return an unique id associated with the file', function (done) {
            var manager = new UploadManager(transport, {chunkSize: 100}),
                file1 = new File('1.txt', 50),
                file2 = new File('2.txt', 80),
                counter = 0;

            var id1 = manager.upload(file1);
            var id2 = manager.upload(file2);

            expect(id1).not.to.equal(id2);

            manager.on('complete', function () {
                if (++counter === 2) done();
            });
        });

        it('should split the file in chunks', function (done) {
            var manager = new UploadManager(transport, {chunkSize: 100}),
                file = new File('foo.js', 200);

            manager.upload(file);

            manager.on('complete', function () {
                expect(file.slice.calledWith(0, 100)).to.equal(true);
                expect(file.slice.calledWith(100, 200)).to.equal(true);
                expect(file.slice.callCount).to.equal(2);

                done();
            });
        });


        it('should call transport.initiateUpload', function (done) {
            var manager = new UploadManager(transport, {chunkSize: 100}),
                file = new File('foo.js', 200);

            manager.upload(file);

            manager.on('complete', function () {
                expect(transport.initiateUpload.calledWith(file.name, file.size)).to.equal(true);

                done();
            });
        });

        it('should send the chunks using the specified transport', function (done) {
            var manager = new UploadManager(transport, {chunkSize: 100}),
                file = new File('foo.js', 200);

            manager.upload(file);

            manager.on('complete', function () {
                var serverId = transport.initiateUpload.firstCall.returnValue.valueOf();

                expect(transport.send.calledWith(serverId, {size: 100}, 0, 100)).to.equal(true);
                expect(transport.send.calledWith(serverId, {size: 100}, 100, 200)).to.equal(true);
                expect(transport.send.callCount).to.equal(2);

                done();
            });
        });

        it('should send one chunk at a time', function (done) {
            var manager = new UploadManager(transport, {chunkSize: 100}),
                file = new File('foo.js', 300);

            manager.upload(file);

            manager.on('complete', function () {
                expect(transport._maxConcurrentSends).to.equal(1);

                done();
            });
        });

        it('should send the chunks using the specified transport (size not multiple of chunk size)', function (done) {
            var manager = new UploadManager(transport, {chunkSize: 100}),
                file = new File('foo.js', 239);

            manager.upload(file);

            manager.on('complete', function () {
                var serverId = transport.initiateUpload.firstCall.returnValue.valueOf();

                expect(transport.send.calledWith(serverId, {size: 100}, 0, 100)).to.equal(true);
                expect(transport.send.calledWith(serverId, {size: 100}, 100, 200)).to.equal(true);
                expect(transport.send.calledWith(serverId, {size: 39}, 200, 239)).to.equal(true);
                expect(transport.send.callCount).to.equal(3);

                done();
            });
        });

        it('should wait for the upload to finish before starting a new upload', function (done) {
            var manager = new UploadManager(transport, {chunkSize: 150}),
                file1 = new File('1.png', 280),
                file2 = new File('2.png', 90),
                callback = sinon.spy(),
                counter = 0;

            var id1 = manager.upload(file1);
            var id2 = manager.upload(file2);
            manager.on('start', callback);

            manager.on('complete', function () {
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
            var manager = new UploadManager(transport, {chunkSize: 100}),
                file = new File('1.txt', 300),
                callback = sinon.spy();

            var id = manager.upload(file);
            manager.on('progress', callback);

            manager.on('complete', function () {
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

            var manager = new UploadManager(transport, {chunkSize: 100}),
                file = new File('1.txt', 70);

            var id = manager.upload(file);

            manager.on('error', function (fileId, error) {
                expect(fileId).to.equal(id);
                expect(error).to.be.a(Error);

                done();
            });
        });
    });

    describe('single file, multiple connections', function () {});

    describe('multiple files, multiple connections', function () {});

    // test helpers
    var File = function (name, size) {
        this.name = name;
        this.size = size;
        this.slice = sinon.spy(this.slice);
    };

    File.prototype.slice = function (start, end) {
        return {
            size: Math.min(end, this.size) - start
        };
    };
});
