module.exports =
class ItemView extends HTMLElement

  constructor: ->
    @super

  initialize: (@index, @item) ->
    @item.setView(@);
    @name = document.createElement('td');
    @extension = document.createElement('td');

    @name.textContent = @item.getName();
    @extension.textContent = "ext";

    @.classList.add('item');

    if @item.isFile()
      @.classList.add('file');
    else
      @.classList.add('directory');

    @extension.classList.add('extension');

    @appendChild(@name);
    @appendChild(@extension);

  highlight: (enable) ->
    if enable
      @.classList.add('highlighted');
    else
      @.classList.remove('highlighted');

module.exports = document.registerElement('item-view', prototype: ItemView.prototype, extends: 'tr')
