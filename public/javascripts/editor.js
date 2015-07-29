;
(function () {
  var socket = io.connect(window.location.hostname); // heroku
  //var socket = io.connect('http://localhost:8080');
  var editor = ace.edit("editor");
  var session = editor.getSession();
  var Range = ace.require("ace/range").Range;
  require("ace/multi_select").MultiSelect(editor);
  editor.setTheme("ace/theme/monokai");
  editor.setByAPI = false;
  session.setMode("ace/mode/javascript");
  session.setUseWrapMode(true);
  session.setUseWorker(false);
  editor.$blockScrolling = Infinity;

  var runCode = document.getElementsByClassName('codeEditorBtn')[0];
  var resetCode = document.getElementsByClassName('codeEditorBtn')[1];

  runCode.addEventListener('click', function () {
    var code = editor.getValue();

    var script = document.createElement('script');
    script.appendChild(document.createTextNode(code));
    document.body.appendChild(script);
  });

  resetCode.addEventListener('click', function () {
    log.innerHTML = '';
  });

  var log = document.getElementsByClassName('log')[0];
  console.log = function (message) {
    if (typeof message == 'object') {
      log.innerHTML += (JSON && JSON.stringify ? JSON.stringify(message) : message) + '<br />';
    } else {
      log.innerHTML += message + '<br />';
    }
  };

  socket.on('editorUpdate', function (data) {
    editor.session.addMarker(new Range(1, 0, 1, 200), "ace_active-line", "fullLine");
    editor.setByAPI = true;
    editor.setValue(data.contents);
    editor.clearSelection();
    editor.setByAPI = false;
  });

  editor.on('change', function () {
    if (!editor.setByAPI) {
      socket.emit('editorUpdate', {
        contents: editor.getValue()
      });
    }
  });
})();
