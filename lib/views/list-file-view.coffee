ListItemView = require './list-item-view'

module.exports =
class ListFileView extends ListItemView

  constructor: ->
    super();

  initialize: (containerView, @index, fileController) ->
    super(containerView, fileController);
    @.classList.add('file');

    @name = document.createElement('td');
    @extension = document.createElement('td');

    @name.textContent = fileController.getName();

    if fileController.isLink()
      @name.classList.add('icon', 'icon-file-symlink-file');
    else
      @name.classList.add('icon', 'icon-file-text');

    @extension.textContent = fileController.getExtension();
    @extension.classList.add('extension');

    @appendChild(@name);
    @appendChild(@extension);

  getName: ->
    return @itemController.getName();

  getPath: ->
    return @itemController.getPath();

  isSelectable: ->
    return true;

module.exports = document.registerElement('list-file-view', prototype: ListFileView.prototype, extends: 'tr')
