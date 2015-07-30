;
(function () {
  var socket = io.connect(window.location.hostname); //heroku
  //var socket = io.connect('http://localhost:8080'); // local
  var canvas = new fabric.Canvas('whiteboard', {
    backgroundColor: 'rgb(255, 255, 255)',
    isDrawingMode: true
  });

  var canvasClear = document.getElementsByClassName('clearCanvas')[0];
  canvasClear.addEventListener('click', function () {
    canvas.clear();
  });

  var saveSnapshot = document.getElementsByClassName('save')[0];

  saveSnapshot.addEventListener('click', function () {
    var img = canvas.toDataURL('image/png');
    console.log(img);
  });

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

})();



