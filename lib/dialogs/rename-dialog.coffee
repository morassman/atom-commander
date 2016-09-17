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
    pathUtil = @item.getFileSystem().getPathUtil();

    options.callback = (text) =>
      name = text.trim();
      newPath = pathUtil.join(@directoryPath, name);

      if @oldPath == newPath
        return;

      @item.fileSystem.rename @oldPath, newPath, (err) =>
        if err?
          atom.notifications.addWarning(err);
        else
          # TODO : It's not necessary to refresh the whole directory. Just update the item.
          @containerView.refreshDirectory();

      @containerView.requestFocus();

    options.validate = (text) ->
      name = text.trim();

      if name == @itemName
        return null;

      if name.length == 0
        return "The name may not be empty.";

      parsed = pathUtil.parse(name);

      if parsed.dir != ""
        return "The name should not contain a parent.";

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
