var UploadJS = {};

(function () {
    /**
     * Uploader class
     * @constructor
     * @param {String} id the id of the input type="file" element
     */
    var Uploader = function (id) {
        var self = this;

        this.upload = document.getElementById(id);
        this.btn = document.getElementById('btnUpload');

        if (!this.upload) {
            throw new Error('The specifed id does not exist in DOM');
        }

        this.btn.addEventListener('click', function () {
            self.upload.click();
        });

        this.upload.addEventListener('change', function () {
            self.processFiles(self.upload.files);
        });
    };

    /**
     * Processes the selected files when the user selects new files to upload.
     * @param files currently selected files
     */
    Uploader.prototype.processFiles = function (files) {
        for(var i = 0; i < files.length; i++) {
        	console.log(files[i].name);
        	var reader = new FileReader();  
            reader.onload = function(e) { console.log(e.target.result); };
            reader.readAsBinaryString(files[i]);
        }
    };

    UploadJS.Uploader = Uploader;
})();

