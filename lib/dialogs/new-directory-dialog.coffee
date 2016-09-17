fs = require 'fs-plus'
InputDialog = require '@aki77/atom-input-dialog'

module.exports =
class NewDirectoryDialog extends InputDialog

  constructor: (@containerView, @directory) ->
    super({prompt:"Enter a name for the new folder:"});

  initialize: () ->
    options = {};
    pathUtil = @directory.getFileSystem().getPathUtil();
    
    options.callback = (text) =>
      name = text.trim();
      path = pathUtil.join(@directory.getPath(), name);

      @directory.fileSystem.makeDirectory path, (err) =>
        if err?
          atom.notifications.addWarning(err);
        else
          snapShot = {};
          snapShot.name = name;
          @containerView.refreshDirectoryWithSnapShot(snapShot);

    options.validate = (text) ->
      name = text.trim();

      if name.length == 0
        return "The folder name may not be empty.";

      if @directory.fileSystem.isLocal()
        if fs.isDirectorySync(pathUtil.join(@directory.getPath(), name))
          return "A folder with this name already exists."

      return null;

    super(options);
