fs = require 'fs-plus'
path = require 'path'
InputDialog = require '@aki77/atom-input-dialog'

module.exports =
class RenameDialog extends InputDialog

  # item : Either a File or a Directory.
  constructor: (@containerView, @item) ->
    super({prompt:'Enter a new name:'});

  initialize: () ->
    @itemName = @item.getBaseName();
    @oldPath = @item.getRealPathSync();
    @directoryPath = @item.getParent().getRealPathSync();

    options = {};
    options.defaultText = @itemName;

    options.callback = (text) =>
      name = text.trim();
      newPath = path.join(@directoryPath, name);

      if @oldPath != newPath
        fs.moveSync(@oldPath, newPath);
        @containerView.requestFocus();

    options.validate = (text) ->
      name = text.trim();

      if name.length == 0
        return 'The name may not be empty.'

      if name != @itemName
        newPath = path.join(@directoryPath, name);

        if fs.isFileSync(newPath)
          return "A file with this name already exists."
        else if fs.isDirectorySync(newPath)
          return "A folder with this name already exists."

      return null;

    super(options);
