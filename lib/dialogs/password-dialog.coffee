InputDialog = require '@aki77/atom-input-dialog'

module.exports =
class PasswordDialog extends InputDialog

  constructor: (prompt, @callback) ->
    super({prompt});

  initialize: ->
    options = {};

    options.callback = @callback;
    options.validate = (text) ->
      return null;

    super(options);
    @miniEditor.addClass("atom-commander-password");
