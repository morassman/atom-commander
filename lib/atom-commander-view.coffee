ListView = require './views/list-view'
FSItem = require './model/fs-item'
{Directory} = require 'atom'
{View} = require 'atom-space-pen-views'

module.exports =
class AtomCommanderView extends View

  constructor: ->
    super();
    root = new Directory("/");

    @leftView.addClass('left');
    @rightView.addClass('right');

    @leftView.openDirectory(root);
    @rightView.openDirectory(root);

  @content: ->
    @div {class: 'atom-commander'}, =>
      @div {class: 'content'}, =>
        @subview 'leftView', new ListView()
        @subview 'rightView', new ListView();

  initialize: ->
    atom.commands.add @element,
     'atom-commander:focus-other-view': => @focusOtherView()

  destroy: ->
    @element.remove();

  getElement: ->
    @element

  focusOtherView: ->
    if @leftView.hasFocus()
      @rightView.focus();
    else
      @leftView.focus();
