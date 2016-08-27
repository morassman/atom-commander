ListItemView = require './list-item-view'

module.exports =
class ListSymLinkView extends ListItemView

  constructor: ->
    super();

  initialize: (containerView, index, symLinkController) ->
    super(containerView, index, symLinkController);
    @refresh();

  refresh: ->
    super();

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

  getNameColumnValue: ->
    targetController = @itemController.getTargetController();

    if targetController?
      targetItem = targetController.getItem();

    if !targetItem?
      return @itemController.getName();

    if targetItem.isDirectory()
      return @itemController.getName();

    if @containerView.isExtensionColumnVisible()
      return @itemController.getNamePart();

    return @itemController.getName();

  getExtensionColumnValue: ->
    if @containerView.isExtensionColumnVisible()
      return @itemController.getExtensionPart();

    return '';

  getSizeColumnValue: ->
    targetController = @itemController.getTargetController();

    if targetController?
      targetItem = targetController.getItem();

    if !targetItem?
      return '';

    if targetItem.isDirectory()
      return '';

    return super;

  isSelectable: ->
    return true;

module.exports = document.registerElement('list-symlink-view', prototype: ListSymLinkView.prototype, extends: 'tr')
