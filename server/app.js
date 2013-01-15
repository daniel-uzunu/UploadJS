var express = require('express'),
    path = require('path'),
    fs = require('fs'),
    app = express();

console.log(__dirname);

app.use(app.router);
app.use(express.static(path.join(__dirname, '..', 'web')));

app.post('/upload', function (req, res) {
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
});

app.listen(3000);
console.log('server started');
