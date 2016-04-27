filesize = require 'filesize'

module.exports =
class ItemController

  constructor: (@item) ->
    @item.setController(@);

  initialize: (@itemView) ->

  # Called if anything about the item changed.
  refresh: ->
    @itemView?.refresh();

  getItem: ->
    return @item;

  getItemView: ->
    return @itemView;

  getContainerView: ->
    return @itemView.getContainerView();

  getName: ->
    return @item.getBaseName();

  getNamePart: ->
    return @getName();

  getExtensionPart: ->
    return "";

  getPath: ->
    return @item.getRealPathSync();

  # Override to indicate if this item can be renamed.
  canRename: ->
    return @item.isWritable();

  isLink: ->
    return @item.isLink();

  getNameExtension: ->
    baseName = @item.getBaseName();

    if !baseName?
      return ["", ""];

    index = baseName.lastIndexOf(".");
    lastIndex = baseName.length - 1;

    if (index == -1) or (index == 0) or (index == lastIndex)
      return [baseName, ''];

    return [baseName.slice(0, index), baseName.slice(index + 1)];

  getFormattedModifyDate: ->
    date = @item.getModifyDate();
    if date?
      return date.toLocaleDateString();
    return "";

  getFormattedSize: ->
    size = @item.getSize();
    if size?
      return filesize(size);
    return "";

  # Override this to implement the open behavior of this item.
  performOpenAction: ->
