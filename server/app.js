var express = require('express'),
    path = require('path'),
    app = express();

//app.use(express.bodyParser());
app.use(app.router);
app.use(express.static(path.join(__dirname, '..', 'web')));

app.post('/upload', function (req, res) {
    console.log('start: ', req.headers['content-length']);

    var buffer = new Buffer(parseInt(req.headers['content-length'], 10)),
        i = 0;

    req.on('data', function (data) {
        //console.log('data: ', data.length);
        data.copy(buffer, i);
        i += data.length;
    });

    req.on('end', function () {
        console.log('end: ', buffer.length);
        console.log('i: ', i);
        res.end('done');
    });
});

app.listen(3000);
console.log('server started');
