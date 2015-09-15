module.exports =
class ItemController

  constructor: (@item) ->

  initialize: (@itemView) ->

  getItem: ->
    return @item;

  getItemView: ->
    return @itemView;

  getContainerView: ->
    return @itemView.getContainerView();

  # Override to indicate if this item can be renamed.
  canRename: ->
    return @item.isWritable();

  isLink: ->
    return @item.isLink();

  # Override this to implement the open behavior of this item.
  performOpenAction: ->
