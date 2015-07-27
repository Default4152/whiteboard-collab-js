var express = require('express');
var path = require('path');
var app = express();

var port = 3000 || process.env.PORT;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/views/index.html'));
});

var io = require('socket.io').listen(app.listen(port));

io.sockets.on('connection', function (socket) {
  socket.on('draw', function (data) {
    socket.broadcast.emit('draw', data);
  });
});

