var express = require('express'),
    path = require('path'),
    app = express();

app.use('/', express.static(path.join(__dirname, 'setup')));
app.use('/mocha', express.static(path.join(__dirname, 'mocha')));
app.use('/tests', express.static(path.join(__dirname, 'tests')));
app.use('/src', express.static(path.join(__dirname, '../../web/js')));

app.listen(5000);
