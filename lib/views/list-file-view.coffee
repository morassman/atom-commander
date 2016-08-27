ListItemView = require './list-item-view'

module.exports =
class ListFileView extends ListItemView

  constructor: ->
    super();

  initialize: (containerView, index, fileController) ->
    super(containerView, index, fileController);
    @.classList.add('file');

    if fileController.isLink()
      @name.classList.add('icon', 'icon-file-symlink-file');
    else
      @name.classList.add('icon', 'icon-file-text');

    @name.textContent = @getNameColumnValue();
    @extension.textContent = fileController.getExtensionPart();

  getName: ->
    return @itemController.getName();

  getPath: ->
    return @itemController.getPath();

  isSelectable: ->
    return true;

  getNameColumnValue: ->
    if @containerView.isExtensionColumnVisible()
      return @itemController.getNamePart();

    return @itemController.getName();

  getExtensionColumnValue: ->
    if @containerView.isExtensionColumnVisible()
      return @itemController.getExtensionPart();

    return '';

module.exports = document.registerElement('list-file-view', prototype: ListFileView.prototype, extends: 'tr')
