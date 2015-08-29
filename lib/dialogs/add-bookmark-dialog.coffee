fs = require 'fs-plus'
InputDialog = require '@aki77/atom-input-dialog'

module.exports =
class AddBookmarkDialog extends InputDialog

  constructor: (@main, @name, @path, @fromView) ->
    super({prompt:"Enter a name for the bookmark (may be empty): #{@path}"});

  initialize: () ->
    options = {};
    options.defaultText = @name;

    options.callback = (text) =>
      @main.addBookmark(text.trim(), @path);

      if @fromView
        @main.mainView.refocusLastView();

    options.validate = (text) ->
      return null;

    super(options);
