var UploadJS = {};

(function () {
    var Uploader = function (id) {
        this.elem = document.getElementById(id);
        if (!this.elem) {
            throw new Error('The specifed id does not exist in DOM');
        }

        this.elem.addEventListener('change', function () {
            console.log(this.files);
        }, false);
    };

    Uploader.prototype.method = function () {
        
    };

    UploadJS.Uploader = Uploader;
})();

