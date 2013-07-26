var express = require('express'),
    path = require('path'),
    fs = require('fs'),
    Q = require('q'),
    app = express();

console.log(__dirname);

app.use(app.router);
app.use(express.static(path.join(__dirname, '..', 'web')));

app.post('/upload', function (req, res) {
    getData(req).then(function (buffer) {
        console.log(JSON.parse(buffer.toString()));
    });
});

app.post('/upload/:id', function (req, res) {
    console.log(req.params.id);
});

/**
 * Waits for all the data events of a request and returns a buffer containing the entire request
 * body.
 *
 * @param {Request} req the request object
 * @returns {Promise}
 */
function getData(req) {
    var deferred = Q.defer(),
        parts = [],
        byteLength = 0;

    req.on('data', function (data) {
        parts.push(data);
        byteLength += data.length;
    });

    req.on('end', function () {
        deferred.resolve(Buffer.concat(parts, byteLength));
    });

    return deferred.promise;
}

/*app.post('/upload', function (req, res) {
    console.log('start: ', req.headers['content-length']);

    var file = path.join(__dirname, '..', 'upload', 'file.bin');
    var fd = fs.openSync(file, 'a');

    var buffer = new Buffer(parseInt(req.headers['content-length'], 10)),
        i = 0;

    req.on('data', function (data) {
        //console.log('data: ', data.length);
        data.copy(buffer, i);
        i += data.length;
    });

    req.on('end', function () {
        //console.log('end: ', buffer.length);
        //console.log('i: ', i);
        fs.writeSync(fd, buffer, 0, buffer.length);
        fs.closeSync(fd);
        res.end('done');
    });
});*/

app.listen(3000);
console.log('server started');
