ListItemView = require './list-item-view'

module.exports =
class ListDirectoryView extends ListItemView

  constructor: ->
    super();

  initialize: (containerView, @index, @parentDirectory, directoryController) ->
    super(containerView, directoryController);
    @.classList.add('directory');

    @name = document.createElement('td');
    @extension = document.createElement('td');

    @name.textContent = @getName();

    if @parentDirectory
      @name.classList.add('icon', 'icon-arrow-up');
    else
      @name.classList.add('icon', 'icon-file-directory');

    @appendChild(@name);
    @appendChild(@extension);

  getName: ->
    if @parentDirectory
      return "..";

    return @itemController.getName();

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
