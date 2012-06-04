var express = require('express'),
	path = require('path'),
	app = express.createServer();

app.use(express.bodyParser());
app.use(app.router);
app.use(express.static(path.join(__dirname, '..', 'web')));

app.post('/upload', function (req, res) {
	console.log(req.body);
	res.end('done');
});

app.listen(3000);
console.log('server started');
