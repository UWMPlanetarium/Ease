// Modules
var express = require('express');
var app = express();
var server = require('http').createServer(app);

app.get('*', function(req, res) {

	console.log(req.url);

	var file = req.url;

	res.sendFile(__dirname + '/firebase/public/' + file);

});

server.listen(3000);
console.log("Server started at 127.0.0.1:3000")
