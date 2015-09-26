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
FTPFileSystem = require './fs/ftp/ftp-filesystem'

module.exports =
class AtomCommanderView extends View

  constructor: (@main, state)->
    super(@main);

    @focusedView = @leftView;

    @menuBar.setMainView(@);
    @leftView.setMainView(@);
    @rightView.setMainView(@);

    @leftView.addClass('left');
    @rightView.addClass('right');

    @leftView.deserialize(state.leftPath, state.left);
    @rightView.deserialize(state.rightPath, state.right);

    if state.height
      @leftView.setContentHeight(state.height);
      @rightView.setContentHeight(state.height);

  @content: ->
    buttonStyle = 'width: 11.1%';

    @div {class: 'atom-commander atom-commander-resizer'}, =>
      @div class: 'atom-commander-resize-handle', outlet: 'resizeHandle'
      @subview 'menuBar', new MenuBarView();
      @div {class: 'content'}, =>
        @subview 'leftView', new ListView(true)
        @subview 'rightView', new ListView(false)
      @div {class: 'btn-group-xs'}, =>
        @button 'F2 Rename', {class: 'btn', style: buttonStyle, click: 'renameButton'}
        @button 'F3 Add Project', {class: 'btn', style: buttonStyle, click: 'addProjectButton'}
        @button 'F4 New File', {class: 'btn', style: buttonStyle, click: 'newFileButton'}
        @button 'F5 Copy', {class: 'btn', style: buttonStyle, click: 'copyButton'}
        @button 'F6 Move', {class: 'btn', style: buttonStyle, click: 'moveButton'}
        @button 'F7 New Folder', {class: 'btn', style: buttonStyle, click: 'newDirectoryButton'}
        @button 'F8 Delete', {class: 'btn', style: buttonStyle, click: 'deleteButton'}
        @button 'F9 Focus', {class: 'btn', style: buttonStyle, click: 'focusButton'}
        @button 'F10 Hide', {class: 'btn', style: buttonStyle, click: 'hideButton'}

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
      'atom-commander:focus': => @focusButton();
      'atom-commander:hide': => @hideButton();
      'atom-commander:mirror': => @mirror();

    @on 'mousedown', '.atom-commander-resize-handle', (e) => @resizeStarted(e);

    @keyup (e) => @handleKeyUp(e);
    @keydown (e) => @handleKeyDown(e);
    @keypress (e) => @handleKeyPress(e);

  destroy: ->
    @leftView.dispose();
    @rightView.dispose();
    @element.remove();
    @ftpFileSystem?.disconnect();

  getElement: ->
    return @element;

  handleKeyDown: (e) ->
    if e.altKey and @menuBar.isHidden()
      @menuBar.reset();
      @menuBar.show();
      e.preventDefault();
      e.stopPropagation();
    else if @menuBar.isVisible()
      @menuBar.handleKeyDown(e);
      e.preventDefault();
      e.stopPropagation();

  handleKeyUp: (e) ->
    if e.altKey
      @menuBar.handleKeyUp(e);
      e.preventDefault();
      e.stopPropagation();
    else if @menuBar.isVisible()
      @hideMenuBar();
      e.preventDefault();
      e.stopPropagation();

  handleKeyPress: (e) ->
    if @menuBar.isVisible()
      @menuBar.handleKeyUp(e);
      e.preventDefault();
      e.stopPropagation();

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

  getMain: ->
    return @main;

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

    srcFileSystem = srcView.directory.fileSystem;
    dstFileSystem = dstView.directory.fileSystem;

    if srcFileSystem.isRemote() or dstFileSystem.isRemote()
      if move
        atom.notifications.addWarning("Move to/from remote file systems are not yet supported.");
      else
        atom.notifications.addWarning("Copy to/from remote file systems are not yet supported.");
      return;

    if srcView.getURI() == dstView.getURI()
      return;

    srcPath = srcView.getPath();
    dstPath = dstView.getPath();

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
    itemViews = view.getSelectedItemViews(true);

    if itemViews.length == 0
      return;

    option = atom.confirm
      message: 'Delete'
      detailedMessage: 'Delete the selected files?'
      buttons: ["No", "Yes"]

    if option == 0
      return;

    for itemView in itemViews
      itemView.getItem().delete();

    @focusedView.refreshDirectory();

  newDirectoryButton: ->
    directory = @getFocusedViewDirectory();

    if directory == null
      return;

    dialog = new NewDirectoryDialog(@focusedView, directory);
    dialog.attach();

  focusButton: ->
    @main.toggleFocus();

  hideButton: ->
    @main.hidePanel();

  mirror: ->
    if @focusedView != null
      snapShot = @focusedView.captureSnapShot();
      @getOtherView(@focusedView).openDirectory(@focusedView.directory, snapShot);

  swap: ->
    if @focusedView == null
      return;

    otherView = @getOtherView(@focusedView);

    snapShot = @focusedView.captureSnapShot();
    otherSnapShot = otherView.captureSnapShot();

    directory = @focusedView.directory;
    otherDirectory = otherView.directory;

    @focusedView.openDirectory(otherDirectory, otherSnapShot);
    otherView.openDirectory(directory, snapShot);

    otherView.requestFocus();

  refocusLastView: ->
    if @focusedView != null
      @focusView(@focusedView);
    else
      @focusView(@leftView);

  fileSystemRemoved: (fileSystem) ->
    @leftView.fileSystemRemoved(fileSystem);
    @rightView.fileSystemRemoved(fileSystem);

  serialize: ->
    state = {};

    state.left = @leftView.serialize();
    state.right = @rightView.serialize();
    state.height = @leftView.getContentHeight();

    return state;
