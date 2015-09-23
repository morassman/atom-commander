fs = require 'fs-plus'
InputDialog = require '@aki77/atom-input-dialog'

module.exports =
class AddBookmarkDialog extends InputDialog

  constructor: (@main, @name, @item, @fromView) ->
    super({prompt:"Enter a name for the bookmark (may be empty): #{@item.getPath()}"});

  initialize: () ->
    options = {};
    options.defaultText = @name;

    options.callback = (text) =>
      @main.getBookmarkManager().addBookmark(text.trim(), @item);

      if @fromView
        @main.mainView.refocusLastView();

    options.validate = (text) ->
      return null;

    super(options);
