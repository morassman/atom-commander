ListView = require './views/list-view'
FSItem = require './model/fs-item'
{Directory} = require 'atom'
{View} = require 'atom-space-pen-views'

module.exports =
class AtomCommanderView extends View

  constructor: ->
    super();

    @leftView.addClass('left');
    @rightView.addClass('right');

    directory = @getInitialDirectory();

    @leftView.openDirectory(directory);
    @rightView.openDirectory(directory);

  getInitialDirectory: ->
    directories = atom.project.getDirectories();

    if directories.length > 0
      return directories[0];

    directory = new File(atom.config.getUserConfigPath()).getParent();

    if (directory.existsSync())
      return directory;

    return new Directory('/');

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
