'use strict';

describe('Upload Manager', function () {
    var UploadManager, manager, files;

    beforeEach(function () {
        UploadManager = UploadJS.UploadManager;
        manager = new UploadManager();
        files = [
            {name: '1.txt', size: 100},
            {name: '2.png', size: 300},
            {name: '3.js', size: 50}
        ];
    });

    it('should add a file to the queue', function () {
        manager.upload(files[0]);

        expect(manager.getAllFiles()).to.contain(files[0]);
    });

    it('should add a list of files to the queue', function () {
        manager.upload(files);

        for (var i = 0; i < files.length; i++) {
            expect(manager.getAllFiles()).to.contain(files[i]);
        }
    });

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

    it('should start uploading when no file is uploading' , function () {
        var callback = sinon.spy();

        manager.on('uploadStarted', callback);
        manager.upload(files[0]);

        expect(callback.calledWith(files[0])).to.equal(true);
    });
});
