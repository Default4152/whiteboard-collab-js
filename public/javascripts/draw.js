;
(function () {
  //var socket = io.connect(window.location.hostname); //heroku
  var socket = io.connect('http://localhost:8080'); // local
  var canvas = new fabric.Canvas('whiteboard', {
    backgroundColor: 'rgb(255, 255, 255)',
    isDrawingMode: true
  });

  window.addEventListener('resize', resizeCanvas);

  function resizeCanvas() {
    canvas.setHeight(window.innerHeight);
    canvas.setWidth(window.innerWidth);
  }

  var bWidth = document.getElementsByClassName('bWidth')[0];
  var bColor = document.getElementsByClassName('bColor')[0];

  canvas.freeDrawingBrush.width = bWidth.value;

  bColor.addEventListener('input', function () {
    canvas.freeDrawingBrush.color = this.value;
  });

  bWidth.addEventListener('input', function () {
    canvas.freeDrawingBrush.width = this.value;
  });

  socket.on('draw', function (data) {
    fabric.Path.fromObject(data, function (path) {
      canvas.add(path);
    })
  });

  canvas.on('path:created', function (e) {
    socket.emit('draw', e.path);
  });

  resizeCanvas();
})();



