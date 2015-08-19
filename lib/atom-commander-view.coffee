fs = require 'fs-plus'
{Directory} = require 'atom'
{View} = require 'atom-space-pen-views'
ListView = require './views/list-view'
NewFileDialog = require './dialogs/new-file-dialog'
NewDirectoryDialog = require './dialogs/new-directory-dialog'

module.exports =
class AtomCommanderView extends View

  constructor: (@main)->
    super(@main);

    @focusedView = null;

    @leftView.setMainView(@);
    @rightView.setMainView(@);

    @leftView.addClass('left');
    @rightView.addClass('right');

    directory = @getInitialDirectory();

    @leftView.openDirectory(directory);
    @rightView.openDirectory(directory);

  getInitialDirectory: ->
    directories = atom.project.getDirectories();

    if directories.length > 0
      return directories[0];

    return new Directory(fs.getHomeDirectory());

  @content: ->
    @div {class: 'atom-commander'}, =>
      @div {class: 'content'}, =>
        @subview 'leftView', new ListView()
        @subview 'rightView', new ListView();
      @div {class: 'btn-group-xs'}, =>
        @button 'F3 Add Project', {class: 'btn', style: 'width: 14.28%', click: 'addProjectButton'}
        @button 'F4 New File', {class: 'btn', style: 'width: 14.28%', click: 'newFileButton'}
        @button 'F5 Copy', {class: 'btn disabled', style: 'width: 14.28%'}
        @button 'F6 Move', {class: 'btn disabled', style: 'width: 14.28%'}
        @button 'F7 Make Dir', {class: 'btn', style: 'width: 14.28%', click: 'newDirectoryButton'}
        @button 'F8 Delete', {class: 'btn disabled', style: 'width: 14.28%'}
        @button 'F9 Hide', {class: 'btn', style: 'width: 14.28%', click: 'hideButton'}

  initialize: ->
    atom.commands.add @element,
      'atom-commander:focus-other-view': => @focusOtherView()
      'atom-commander:add-project': => @addProjectButton();
      'atom-commander:new-file': => @newFileButton();
      'atom-commander:new-directory': => @newDirectoryButton();
      'atom-commander:hide': => @hideButton();

  destroy: ->
    @leftView.dispose();
    @rightView.dispose();
    @element.remove();

  getElement: ->
    @element

  getOtherView: (view) ->
    if view == @leftView
      return @rightView;

    return @leftView;

  focusView: (@focusedView) ->
    otherView = @getOtherView(@focusedView);
    otherView.unfocus();
    @focusedView.focus();

  focusOtherView: ->
    if @leftView.hasFocus()
      @focusView(@rightView);
    else
      @focusView(@leftView);

  addProjectButton: ->
    if @focusedView != null
      @focusedView.addProject();

  getFocusedViewDirectory: ->
    if @focusedView == null
      return null;

    return @focusedView.directory;

  newFileButton: ->
    directory = @getFocusedViewDirectory();

    if directory == null
      return;

    dialog = new NewFileDialog(@focusedView, directory);
    dialog.attach();

  newDirectoryButton: ->
    directory = @getFocusedViewDirectory();

    if directory == null
      return;

    dialog = new NewDirectoryDialog(@focusedView, directory);
    dialog.attach();

  hideButton: ->
    @main.hide();

  refocusLastView: ->
    if @focusedView != null
      @focusView(@focusedView);
    else
      @focusView(@leftView);
