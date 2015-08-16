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

    @name.textContent = @getName();
    @name.classList.add('icon', 'icon-file-text');

    @extension.textContent = "ext";
    @extension.classList.add('extension');

    @appendChild(@name);
    @appendChild(@extension);

  getName: ->
    return @itemController.getName();

module.exports = document.registerElement('list-file-view', prototype: ListFileView.prototype, extends: 'tr')
