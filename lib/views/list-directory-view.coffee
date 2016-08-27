ListItemView = require './list-item-view'

module.exports =
class ListDirectoryView extends ListItemView

  constructor: ->
    super();

  initialize: (containerView, index, @parentDirectory, directoryController) ->
    super(containerView, index, directoryController);

    # @name.classList.add('directory');
    @name.className += ' directory';
    @name.textContent = @getName();
    @size.textContent = '';

    if @parentDirectory
      @name.classList.add('icon', 'icon-arrow-up');
      @date.textContent = '';
    else if directoryController.isLink()
      @name.classList.add('icon', 'icon-file-symlink-directory');
    else
      @name.classList.add('icon', 'icon-file-directory');

  getName: ->
    if @parentDirectory
      return "..";

    return @itemController.getName();

  getNameColumnValue: ->
    return @getName();

  getExtensionColumnValue: ->
    return '';

  getSizeColumnValue: ->
    return '';

  getDateColumnValue: ->
    if @parentDirectory
      return '';

    return super;

  canRename: ->
    if @parentDirectory
      return false;

    return super();

  getPath: ->
    @itemController.getPath();

  isSelectable: ->
    return !@parentDirectory;

  performOpenAction: ->
    if @parentDirectory
      @getContainerView().openParentDirectory();
    else
      super();

module.exports = document.registerElement('list-directory-view', prototype: ListDirectoryView.prototype, extends: 'tr')
