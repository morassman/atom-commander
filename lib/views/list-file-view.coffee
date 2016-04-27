ListItemView = require './list-item-view'

module.exports =
class ListFileView extends ListItemView

  constructor: ->
    super();

  initialize: (containerView, index, fileController) ->
    super(containerView, index, fileController);
    @.classList.add('file');

    @name.textContent = fileController.getNamePart();

    if fileController.isLink()
      @name.classList.add('icon', 'icon-file-symlink-file');
    else
      @name.classList.add('icon', 'icon-file-text');

    @extension.textContent = fileController.getExtensionPart();

  getName: ->
    return @itemController.getName();

  getPath: ->
    return @itemController.getPath();

  isSelectable: ->
    return true;

module.exports = document.registerElement('list-file-view', prototype: ListFileView.prototype, extends: 'tr')
