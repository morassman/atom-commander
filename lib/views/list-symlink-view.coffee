ListItemView = require './list-item-view'

module.exports =
class ListSymLinkView extends ListItemView

  constructor: ->
    super();

  initialize: (containerView, @index, symLinkController) ->
    super(containerView, symLinkController);

    @name = document.createElement('td');
    @extension = document.createElement('td');

    @extension.classList.add('extension');

    @appendChild(@name);
    @appendChild(@extension);
    @refresh();

  refresh: ->
    @name.textContent = @itemController.getNamePart();
    @extension.textContent = @itemController.getExtensionPart();

    targetController = @itemController.getTargetController();

    if targetController?
      targetItem = targetController.getItem();

    @.classList.remove('file', 'directory');
    @name.classList.remove('icon-link');

    if targetItem?.isFile()
      @.classList.add('file');
      @name.classList.add('icon-file-symlink-file');
    else if targetItem?.isDirectory()
      @.classList.add('directory');
      @name.classList.add('icon', 'icon-file-symlink-directory');
    else
      @name.classList.add('icon', 'icon-link');

  getName: ->
    return @itemController.getName();

  getPath: ->
    return @itemController.getPath();

  isSelectable: ->
    return true;

module.exports = document.registerElement('list-symlink-view', prototype: ListSymLinkView.prototype, extends: 'tr')
