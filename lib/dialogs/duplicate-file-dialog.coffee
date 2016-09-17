Utils = require '../utils'
fse = require 'fs-extra'
InputDialog = require '@aki77/atom-input-dialog'

module.exports =
class DuplicateFileDialog extends InputDialog

  constructor: (@containerView, @item) ->
    super({prompt:'Enter a name for the duplicate:'});

  initialize: () ->
    @directory = @item.getParent();

    options = {};
    options.defaultText = @item.getBaseName();

    options.callback = (text) =>
      name = text.trim();
      pathUtil = @directory.getFileSystem().getPathUtil();
      newPath = pathUtil.join(@directory.getPath(), name);

      fse.copy @item.getPath(), newPath, (err) ->
        if err?
          Utils.showWarning("Error duplicating "+@item.getPath()+".", err.message, true);

    options.validate = (text) ->
      name = text.trim();

      if name.length == 0
        return 'The name may not be empty.'

      existingItemView = @containerView.getItemViewWithName(name);

      if existingItemView == null
        return null;

      existingItem = existingItemView.getItem();

      if existingItem.isFile()
        return "A file with this name already exists.";
      else if existingItem.isDirectory()
        return "A folder with this name already exists.";

      return null;

    super(options);
