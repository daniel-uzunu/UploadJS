var UploadJS = {};

(function () {

    /* constants */
    var CHUNK_SIZE = 1024 * 1024; //bytes

    /**
     * Uploader class
     * @constructor
     * @param {String} id the id of the input type="file" element
     */
    var Uploader = function (id) {
        var self = this;

        this.uploader = document.getElementById(id);
        this.btn = document.getElementById('btnUpload');

        if (!this.uploader) {
            throw new Error('The specifed id does not exist in DOM');
        }

        this.btn.addEventListener('click', function () {
            self.uploader.click();
        });

        this.uploader.addEventListener('change', function () {
            self.processFiles(self.uploader.files);
        });
    };

    /**
     * Processes the selected files when the user selects new files to upload.
     * @param files currently selected files
     */
    Uploader.prototype.processFiles = function (files) {
        for(var i = 0; i < files.length; i++) {
            console.log(files[i]);
            this.upload(files[i]);
        }
    };

    Uploader.prototype.upload = function (file) {
        for (var i = 0; i < file.size; i += CHUNK_SIZE) {
            var chunk = file.slice(i, i + CHUNK_SIZE);
            this.readFileChunk(chunk);
        }
    };

    Uploader.prototype.readFileChunk = function (fileChunk) {
        var reader = new FileReader();

        reader.addEventListener('progress', function (e) {
            console.log('progress', e);
        });

        reader.addEventListener('load', function (e) {
            console.log('load', e);
            console.log(e.target.result);
        });

        reader.addEventListener('error', function (e) {
            console.log('error', e);
        });

        try {
            reader.readAsBinaryString(fileChunk);
        } catch (ex) {
            console.log('catch', ex);
        }
    };

    UploadJS.Uploader = Uploader;
})();

