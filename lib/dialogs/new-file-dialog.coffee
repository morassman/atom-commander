fs = require 'fs-plus'
InputDialog = require '@aki77/atom-input-dialog'

module.exports =
class NewFileDialog extends InputDialog

  constructor: (@containerView, @directory) ->
    super({prompt:'Enter a name for the new file:'});

  initialize: () ->
    options = {};
    options.callback = (text) =>
      name = text.trim();
      file = @directory.getFile(name);

      file.create().then (created) =>
        if created
          @containerView.refreshDirectory();
          @containerView.highlightIndexWithName(file.getBaseName());
          atom.workspace.open(file.getPath());

    options.validate = (text) ->
      name = text.trim();

      if name.length == 0
        return 'The file name may not be empty.'

      file = @directory.getFile(name);

      if fs.isFileSync(file.getRealPathSync())
        return "A file with this name already exists."

      return null;

    super(options);
