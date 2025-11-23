(function () {
  var Chrome, File, canon;
  var CoffeeMode, JavaScriptMode, editor, filename, open, save, saveAs, setMode;
  console.log = OSX.NSLog;
  canon = require('pilot/canon');
  Chrome = {
    addPane: function(position, html) {
      var el, horizontalDiv, verticalDiv;
      verticalDiv = $('#app-vertical');
      horizontalDiv = $('#app-horizontal');
      el = document.createElement("div");
      el.setAttribute('class', "pane " + position);
      el.innerHTML = html;
      switch (position) {
        case 'top':
        case 'main': return verticalDiv.prepend(el);
        case 'left': return horizontalDiv.prepend(el);
        case 'bottom': return verticalDiv.append(el);
        case 'right': return horizontalDiv.append(el);
        default: return NSLog("I DON'T KNOW HOW TO DEAL WITH " + position);
      }
    },
    createWindow: function(path) {
      var c;
      c = OSX.AtomWindowController.alloc.initWithWindowNibName("AtomWindow");
      c.window;
      return c.window.makeKeyAndOrderFront(null);
    },
    openPanel: function () {
      var panel;
      panel = OSX.NSOpenPanel.openPanel;
      // console.log(panel.runModal !== OSX.NSFileHandlingPanelOKButton ? 'nil': '开');
      if (panel.runModal !== OSX.NSFileHandlingPanelOKButton) {
        console.log(panel.filenames.lastObject);
        return panel.filenames.lastObject;;
      }
      return panel.filenames.lastObject;
    },
    savePanel: function () {
      var panel;
      panel = OSX.NSSavePanel.savePane;
      console.log('测试保存')
      if (panel.runModal !== OSX.NSFileHandlingPanelOKButton) {
        return null;
      }
      return panel.filenames.lastObject;
    },
    writeToPasteboard: function (text) {
      var pb;
      pb = OSX.NSPasteboard.generalPasteboard;
      pb.declareTypes_owner([OSX.NSStringPboardType], null);
      return pb.setString_forType(text, OSX.NSStringPboardType);
    },
    bindKey: function (name, shortcut, callback) {
      return canon.addCommand({
        name: name,
        exec: callback,
        bindKey: {
          win: null,
          mac: shortcut,
          sender: 'editor'
        }
      });
    }
  };
  File = {
    read: function (path) {
      // console.log(OSX.NSString.stringWithContentsOfFile_encoding_error(path, 4, null))
      return OSX.NSString.stringWithContentsOfFile_encoding_error(path, 4, null);
    },
    write: function (path, contents) {
      var str;
      str = OSX.NSString.stringWithString(contents);
      return str.writeToFile_atomically_encoding_error(path, true, 4, null);
    }
  };
  // this.Chrome = Chrome;
  // this.File = File;
  // 初始化编辑器
  editor = ace.edit("editor");
  editor.setTheme("ace/theme/twilight");
  JavaScriptMode = require("ace/mode/javascript").Mode;
  CoffeeMode = require("ace/mode/coffee").Mode;
  console.log('----start-----')
  editor.getSession().setMode(new JavaScriptMode);
  editor.getSession().setUseSoftTabs(true);
  editor.getSession().setTabSize(2);
  filename = null;
  save = function () {
    File.write(filename, editor.getSession().getValue());
    return setMode();
  };
  open = function () {
//    App.window.title = _.last(filename.split('/'));
    // 修正标题的复制
    editor.getSession().setValue(File.read(filename));
    setMode();
  };
  setMode = function () {
    if (/\.js$/.test(filename)) {
      return editor.getSession().setMode(new JavaScriptMode);
    } else if (/\.coffee$/.test(filename)) {
      return editor.getSession().setMode(new CoffeeMode);
    }
  };
  saveAs = function () {
    var file;
    if (file = Chrome.savePanel()) {
      filename = file;
      App.window.title = _.last(filename.split('/'));
      return save();
    }
  };
  Chrome.bindKey('open', 'Command-O', function (env, args, request) {
    var file;
    if (file = Chrome.openPanel()) {
      filename = file;
      open();
    }
  });
  Chrome.bindKey('saveAs', 'Command-Shift-S', function (env, args, request) {
    return saveAs();
  });
  Chrome.bindKey('save', 'Command-S', function (env, args, request) {
    if (filename) {
      return save();
    } else {
      return saveAs();
    }
  });
  Chrome.bindKey('copy', 'Command-C', function (env, args, request) {
    var text;
    text = editor.getSession().doc.getTextRange(editor.getSelectionRange());
    return Chrome.writeToPasteboard(text);
  });
  Chrome.bindKey('eval', 'Command-R', function (env, args, request) {
    return eval(env.editor.getSession().getValue());
  });
  Chrome.bindKey('togglecomment', 'Command-/', function (env) {
    return env.editor.toggleCommentLines();
  });
  Chrome.bindKey('moveforward', 'Alt-F', function (env) {
    return env.editor.navigateWordRight();
  });
  Chrome.bindKey('moveback', 'Alt-B', function (env) {
    return env.editor.navigateWordLeft();
  });
  Chrome.bindKey('deleteword', 'Alt-D', function (env) {
    return env.editor.removeWordRight();
  });
  Chrome.bindKey('selectwordright', 'Alt-B', function (env) {
    return env.editor.navigateWordLeft();
  });
  Chrome.bindKey('fullscreen', 'Command-Return', function (env) {
    return OSX.NSLog('coming soon');
  });
  Chrome.bindKey('consolelog', 'Ctrl-L', function (env) {
    env.editor.insert('console.log ""');
    return env.editor.navigateLeft();
  });
}).call(this);
