BaseItemView = require './base-item-view'
{$} = require 'atom-space-pen-views'

module.exports =
class ListItemView extends BaseItemView

  constructor: ->
    super();

  initialize: (containerView, @index, fileController) ->
    super(containerView, fileController);

    @name = document.createElement('td');
    @extension = document.createElement('td');
    @size = document.createElement('td');
    @date = document.createElement('td');

    @extension.classList.add('align-right');
    @size.classList.add('align-right');
    @date.classList.add('align-right');

    @size.textContent = fileController.getFormattedSize();
    @date.textContent = fileController.getFormattedModifyDate();

    @appendChild(@name);
    @appendChild(@extension);
    @appendChild(@size);
    @appendChild(@date);

  refresh: ->
    @name.textContent = @getNameColumnValue();
    @extension.textContent = @getExtensionColumnValue();
    @size.textContent = @getSizeColumnValue();
    @date.textContent = @getDateColumnValue();

  getNameColumnValue: ->
    return @itemController.getNamePart();

  getExtensionColumnValue: ->
    return @itemController.getExtensionPart();

  getSizeColumnValue: ->
    return @itemController.getFormattedSize();

  getDateColumnValue: ->
    return @itemController.getFormattedModifyDate();

  setSizeColumnVisible: (visible) ->
    if visible
      $(@size).show();
    else
      $(@size).hide();

  setDateColumnVisible: (visible) ->
    if visible
      $(@date).show();
    else
      $(@date).hide();

  setExtensionColumnVisible: (visible) ->
    if visible
      $(@extension).show();
    else
      $(@extension).hide();

    @refresh();
