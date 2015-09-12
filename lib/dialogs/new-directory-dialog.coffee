fs = require 'fs-plus'
PathUtil = require 'path'
InputDialog = require '@aki77/atom-input-dialog'

module.exports =
class NewDirectoryDialog extends InputDialog

  constructor: (@containerView, @directory) ->
    super({prompt:"Enter a name for the new folder:"});

  initialize: () ->
    options = {};
    options.callback = (text) =>
      name = text.trim();
      path = PathUtil.join(@directory.getPath(), name);

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
        if fs.isDirectorySync(PathUtil.join(@directory.getPath(), name))
          return "A folder with this name already exists."

      return null;

    super(options);
