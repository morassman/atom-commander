fs = require 'fs-plus'
InputDialog = require '@aki77/atom-input-dialog'

module.exports =
class NewDirectoryDialog extends InputDialog

  constructor: (@containerView, @directory) ->
    super({prompt:'Enter a name for the new folder:'});

  initialize: () ->
    options = {};
    options.callback = (text) =>
      name = text.trim();
      sub = @directory.getSubdirectory(name);

      sub.create().then (created) =>
        if created
          @containerView.refreshDirectory();
          @containerView.highlightIndexWithName(sub.getBaseName());

    options.validate = (text) ->
      name = text.trim();

      if name.length == 0
        return 'The folder name may not be empty.'

      sub = @directory.getSubdirectory(name);

      if fs.isDirectorySync(sub.getRealPathSync())
        return "A folder with this name already exists."

      return null;

    super(options);
