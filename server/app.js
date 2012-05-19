var express = require('express'),
	path = require('path'),
	app = express.createServer();
app.use(express.static(path.join(__dirname, '..', 'web')));
app.listen(3000);
console.log('server started');
