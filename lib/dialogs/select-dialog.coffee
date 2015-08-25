InputDialog = require '@aki77/atom-input-dialog'

module.exports =
class SelectDialog extends InputDialog

  constructor: (@actions, @containerView, @add) ->
    if @add
      super({prompt:'Select items that matches pattern:'});
    else
      super({prompt:'Deselect items that matches pattern:'});

  initialize: ->
    options = {};
    options.defaultText = "*";

    options.callback = (text) =>
      pattern = text.trim();
      itemViews = @containerView.getItemViewsWithPattern(pattern);

      for itemView in itemViews
        if itemView.isSelectable()
          itemView.select(@add);

    options.validate = (text) ->
      pattern = text.trim();

      if pattern.length == 0
        return 'The pattern may not be empty.'

    super(options);
