var express = require('express');
var path = require('path');
var app = express();

var port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/views/whiteboard.html'));
});

app.get('/codeeditor', function(req, res) {
  res.sendFile(path.join(__dirname + '/views/codeeditor.html'));
});

var io = require('socket.io').listen(app.listen(port));

io.sockets.on('connection', function (socket) {
  socket.on('draw', function (data) {
    socket.broadcast.emit('draw', data);
  });
});

