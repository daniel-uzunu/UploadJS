// Copyright (c) 2012-2013 Daniel Uzunu
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

var express = require('express'),
    path = require('path'),
    crypto = require('crypto'),
    util = require('util'),
    app = express(),
    port = process.env.PORT || 3000,
    ip = process.env.IP,
    uploads = {};

app.use('/', express.static(path.join(__dirname, 'web')));
app.use('/src', express.static(path.join(__dirname, '../client')));
app.use(express.bodyParser());

app.post('/upload', function (req, res) {
    var id = crypto.randomBytes(24).toString('hex'),
        url = '/upload/' + id,
        file = req.body;

    uploads[id] = {
        name: file.name,
        size: file.size,
        buffer: new Buffer(file.size),
        uploadedBytes: 0
    };

    res.end(JSON.stringify({url: url}));
});

// for now I assume that file pieces are sent in order
app.put('/upload/:id', function (request, response) {
    var file = uploads[request.params.id],
        contentLength = parseInt(request.headers['content-length'], 10),
        regex = /^bytes (\d*)-(\d*)\/(\d*)$/,
        matches = request.headers['content-range'].match(regex);

    if (!matches || !file) {
        response.statusCode = 400;
        response.end();
        return;
    }

    var start = parseInt(matches[1], 10);


    request.on('data', function (data) {
        data.copy(file.buffer, start);
        start += data.length;
    });

    request.on('end', function () {
        file.uploadedBytes += contentLength;

        if (file.uploadedBytes !== file.size) {
            response.writeHead(200, {
                'Range': util.format('bytes=0-%s', file.uploadedBytes)
            });
        } else {
            response.statusCode = 201;
            // this buffer should be written to file
            console.log(file.buffer.toString());
        }

        response.end();
    });

});

var server = app.listen(port, ip);
console.log('server started on: ' + port);
