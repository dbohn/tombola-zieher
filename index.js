var serialPort = require("serialport");

var express = require("express");

var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = null;

app.use(express.static('public'));
app.use(express.static('audio'));

app.get('/', function(req, res) {
	res.sendFile('index.html', {
		root: __dirname
	});
});

function setupSerialPort(path) {
	if (port != null && port.isOpen()) {
		port.close(function() {
			setupSerialPort(path)
		});
		return;
	}

	console.log('Connecting to ', path);
	port = new serialPort.SerialPort(path, {
		baudrate: 9600,
		parser: serialPort.parsers.readline("\r\n")
	});

	port.on("open", function() {
		console.log('opened serial connection');

		port.on('data', function(data) {
			if (data == 'Button opened') {
				io.emit('evt', {type: "button", action: "released"});
			}
			console.log('data received: ' + data);
		});
	});
}

io.on('connection', function(socket) {
	console.log('a user connected');
	serialPort.list(function(err, ports) {
		socket.emit('ports', ports);
	});

	socket.on('port-changed', function(port) {
		setupSerialPort(port);
	});

	socket.on('disconnect', function() {
		console.log('user disconnected');
	});
});

var server = http.listen(3000, function() {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
});