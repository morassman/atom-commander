fs = require 'fs-plus'
{Directory, Task} = require 'atom'
{$, View} = require 'atom-space-pen-views'
ListView = require './views/list-view'
MenuBarView = require './views/menu/menu-bar-view'
NewFileDialog = require './dialogs/new-file-dialog'
NewDirectoryDialog = require './dialogs/new-directory-dialog'
RenameDialog = require './dialogs/rename-dialog'
FileController = require './controllers/file-controller'
DirectoryController = require './controllers/directory-controller'

module.exports =
class AtomCommanderView extends View

  constructor: (@main, state)->
    super(@main);

    @focusedView = null;

    @menuBar.setMainView(@);
    @leftView.setMainView(@);
    @rightView.setMainView(@);

    @leftView.addClass('left');
    @rightView.addClass('right');

    @leftView.openDirectory(@getInitialDirectory(state.leftPath));
    @rightView.openDirectory(@getInitialDirectory(state.rightPath));

    if state.height
      @leftView.setContentHeight(state.height);
      @rightView.setContentHeight(state.height);

  getInitialDirectory: (suggestedPath) ->
    if suggestedPath and fs.isDirectorySync(suggestedPath)
      return new Directory(suggestedPath);

    directories = atom.project.getDirectories();

    if directories.length > 0
      return directories[0];

    return new Directory(fs.getHomeDirectory());

  @content: ->
    @div {class: 'atom-commander atom-commander-resizer'}, =>
      @div class: 'atom-commander-resize-handle', outlet: 'resizeHandle'
      @subview 'menuBar', new MenuBarView(@);
      @div {class: 'content'}, =>
        @subview 'leftView', new ListView()
        @subview 'rightView', new ListView()
      @div {class: 'btn-group-xs'}, =>
        @button 'F2 Rename', {class: 'btn', style: 'width: 12.5%', click: 'renameButton'}
        @button 'F3 Add Project', {class: 'btn', style: 'width: 12.5%', click: 'addProjectButton'}
        @button 'F4 New File', {class: 'btn', style: 'width: 12.5%', click: 'newFileButton'}
        @button 'F5 Copy', {class: 'btn', style: 'width: 12.5%', click: 'copyButton'}
        @button 'F6 Move', {class: 'btn', style: 'width: 12.5%', click: 'moveButton'}
        @button 'F7 New Folder', {class: 'btn', style: 'width: 12.5%', click: 'newDirectoryButton'}
        @button 'F8 Delete', {class: 'btn', style: 'width: 12.5%', click: 'deleteButton'}
        @button 'F9 Hide', {class: 'btn', style: 'width: 12.5%', click: 'hideButton'}

  initialize: ->
    @menuBar.hide();

    atom.commands.add @element,
      'atom-commander:focus-other-view': => @focusOtherView()
      'atom-commander:rename': => @renameButton();
      'atom-commander:add-project': => @addProjectButton();
      'atom-commander:new-file': => @newFileButton();
      'atom-commander:copy': => @copyButton();
      'atom-commander:move': => @moveButton();
      'atom-commander:new-folder': => @newDirectoryButton();
      'atom-commander:delete': => @deleteButton();
      'atom-commander:hide': => @hideButton();
      'atom-commander:mirror': => @mirror();

    @on 'mousedown', '.atom-commander-resize-handle', (e) => @resizeStarted(e);

    @keyup (e) => @handleKeyUp(e);
    @keydown (e) => @handleKeyDown(e);

  destroy: ->
    @leftView.dispose();
    @rightView.dispose();
    @element.remove();

  getElement: ->
    @element

  handleKeyDown: (e) ->
    if e.altKey and @menuBar.isHidden()
      @menuBar.reset();
      @menuBar.show();
    else if @menuBar.isVisible()
      @menuBar.handleKeyDown(e);

  handleKeyUp: (e) ->
    if e.altKey
      @menuBar.handleKeyUp(e);
    else if @menuBar.isVisible()
      @hideMenuBar();

  hideMenuBar: ->
    @menuBar.hide();
    @menuBar.reset();
    @refocusLastView();

  resizeStarted: =>
    $(document).on('mousemove', @resizeView)
    $(document).on('mouseup', @resizeStopped)

  resizeStopped: =>
    $(document).off('mousemove', @resizeView)
    $(document).off('mouseup', @resizeStopped)

  resizeView: ({pageY, which}) =>
    return @resizeStopped() unless which is 1

    change = @offset().top - pageY;
    @leftView.adjustContentHeight(change);
    @rightView.adjustContentHeight(change);

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

  renameButton: ->
    if @focusedView == null
      return;

    itemView = @focusedView.getHighlightedItem();

    if ((itemView == null) or !itemView.canRename())
      return;

    if itemView.itemController instanceof FileController
      dialog = new RenameDialog(@focusedView, itemView.itemController.getFile());
      dialog.attach();
    else if itemView.itemController instanceof DirectoryController
      dialog = new RenameDialog(@focusedView, itemView.itemController.getDirectory());
      dialog.attach();

  newFileButton: ->
    directory = @getFocusedViewDirectory();

    if directory == null
      return;

    dialog = new NewFileDialog(@focusedView, directory);
    dialog.attach();

  copyButton: ->
    @copyOrMoveButton(false);

  moveButton: ->
    @copyOrMoveButton(true);

  copyOrMoveButton : (move) ->
    if @focusedView == null
      return;

    srcView = @focusedView;
    dstView = @getOtherView(srcView);
    srcPath = srcView.getPath();
    dstPath = dstView.getPath();

    if srcPath == dstPath
      return;

    srcItemViews = srcView.getSelectedItemViews(true);

    if srcItemViews.length == 0
      return;

    srcNames = [];

    for srcItemView in srcItemViews
      srcNames.push(srcItemView.getName());

    task = Task.once require.resolve('./tasks/copy-task'), srcPath, srcNames, dstPath, move, ->
      if move
        srcView.refreshDirectory();

      dstView.refreshDirectory();

    task.on 'success', (data) =>
      srcItemViews[data.index].select(false);

  deleteButton: ->
    if @focusedView == null
      return;

    # Create a local variable of the focused view in case the focus changes while deleting.
    view = @focusedView;
    srcPath = view.getPath();
    srcNames = view.getSelectedNames(true);

    if srcNames.length == 0
      return;

    option = atom.confirm
      message: 'Delete'
      detailedMessage: 'Delete the selected files?'
      buttons: ["No", "Yes"]

    if option == 1
      Task.once require.resolve('./tasks/delete-task'), srcPath, srcNames, ->
        view.refreshDirectory();

  newDirectoryButton: ->
    directory = @getFocusedViewDirectory();

    if directory == null
      return;

    dialog = new NewDirectoryDialog(@focusedView, directory);
    dialog.attach();

  hideButton: ->
    @main.hide();

  mirror: ->
    if @focusedView != null
      @getOtherView(@focusedView).openDirectory(@focusedView.directory);

  refocusLastView: ->
    if @focusedView != null
      @focusView(@focusedView);
    else
      @focusView(@leftView);

  serialize: ->
    state = {};

    state.leftPath = @leftView.getPath();
    state.rightPath = @rightView.getPath();
    state.height = @leftView.getContentHeight();

    return state;
