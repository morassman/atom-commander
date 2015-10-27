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
Utils = require './utils'
TabbedView = require './views/tabbed-view'

module.exports =
class AtomCommanderView extends View

  constructor: (@main, state)->
    super(@main);

    @menuBar.setMainView(@);
    @leftTabbedView.setMainView(@);
    @rightTabbedView.setMainView(@);

    @leftTabbedView.addClass('left');
    @rightTabbedView.addClass('right');

    @leftTabbedView.deserialize(state.version, state.leftPath, state.left);
    @rightTabbedView.deserialize(state.version, state.rightPath, state.right);

    @leftView = @leftTabbedView.getSelectedView();
    @rightView = @rightTabbedView.getSelectedView();

    if state.height
      @leftTabbedView.setContentHeight(state.height);
      @rightTabbedView.setContentHeight(state.height);

    @focusedView = @getLeftView();

  @content: ->
    buttonStyle = 'width: 11.1%';

    @div {class: 'atom-commander atom-commander-resizer'}, =>
      @div class: 'atom-commander-resize-handle', outlet: 'resizeHandle'
      @subview 'menuBar', new MenuBarView();
      @div {class: 'content'}, =>
        @subview 'leftTabbedView', new TabbedView(true)
        @subview 'rightTabbedView', new TabbedView(false)
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
      'atom-commander:add-tab': => @addTab();
      'atom-commander:remove-tab': => @removeTab();
      'atom-commander:previous-tab': => @previousTab();
      'atom-commander:next-tab': => @nextTab();
      'atom-commander:shift-tab-left': => @shiftTabLeft();
      'atom-commander:shift-tab-right': => @shiftTabRight();

    @on 'mousedown', '.atom-commander-resize-handle', (e) => @resizeStarted(e);

    @keyup (e) => @handleKeyUp(e);
    @keydown (e) => @handleKeyDown(e);
    @keypress (e) => @handleKeyPress(e);

  destroy: ->
    @leftView.dispose();
    @rightView.dispose();
    @element.remove();

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
    @leftTabbedView.adjustContentHeight(change);
    @rightTabbedView.adjustContentHeight(change);

  getMain: ->
    return @main;

  getLeftView: ->
    return @leftTabbedView.getSelectedView();

  getRightView: ->
    return @rightTabbedView.getSelectedView();

  getOtherView: (view) ->
    if view.isLeft()
      return @getRightView();

    return @getLeftView();

  focusView: (@focusedView) ->
    otherView = @getOtherView(@focusedView);
    otherView.unfocus();
    @focusedView.focus();

  focusOtherView: ->
    if @getLeftView().hasFocus()
      @focusView(@getRightView());
    else
      @focusView(@getLeftView());

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

    # Do nothing if the src and dst folders are the same.
    if srcView.getURI() == dstView.getURI()
      return;

    # Do nothing if nothing is selected.
    srcItemViews = srcView.getSelectedItemViews(true);

    if srcItemViews.length == 0
      return;

    srcFileSystem = srcView.directory.fileSystem;
    dstFileSystem = dstView.directory.fileSystem;

    if move
      if srcFileSystem.isRemote() or dstFileSystem.isRemote()
        atom.notifications.addWarning("Move to/from remote file systems is not supported.");
        return;
    # else if srcFileSystem.isRemote() and dstFileSystem.isRemote()
    #   atom.notifications.addWarning("Copy between remote file systems is not yet supported.");
    #   return;

    srcPath = srcView.getPath();
    dstPath = dstView.getPath();

    if srcFileSystem.isRemote()
      items = [];

      for srcItemView in srcItemViews
        items.push(srcItemView.getItem());

      srcFileSystem.getTaskManager().downloadItems dstPath, items, (canceled, err, item) ->
        if !canceled and err?
          message = "Error downloading "+item.getURI();
          Utils.showErrorWarning("Download failed", message, null, err, true);

      return;

    if dstFileSystem.isRemote()
      items = [];

      for srcItemView in srcItemViews
        items.push(srcItemView.getItem());

      dstFileSystem.getTaskManager().uploadItems dstPath, items, (canceled, err, item) ->
        if !canceled and err?
          message = "Error uploading "+item.getURI();
          Utils.showErrorWarning("Upload failed", message, null, err, true);

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
      message: "Delete"
      detailedMessage: "Delete the selected files?"
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
      @focusView(@getLeftView());

  getFocusedTabbedView: ->
    if @focusedView == null
      return null;

    if @focusedView.isLeft()
      return @leftTabbedView;

    return @rightTabbedView;

  addTab: ->
    focusedTabbedView = @getFocusedTabbedView();

    if focusedTabbedView == null
      return;

    focusedTabbedView.insertTab();

  removeTab: ->
    focusedTabbedView = @getFocusedTabbedView();

    if focusedTabbedView == null
      return;

    focusedTabbedView.removeSelectedTab();

  previousTab: ->
    focusedTabbedView = @getFocusedTabbedView();

    if focusedTabbedView != null
      focusedTabbedView.previousTab();

  nextTab: ->
    focusedTabbedView = @getFocusedTabbedView();

    if focusedTabbedView != null
      focusedTabbedView.nextTab();

  shiftTabLeft: ->
    focusedTabbedView = @getFocusedTabbedView();

    if focusedTabbedView != null
      focusedTabbedView.shiftLeft();

  shiftTabRight: ->
    focusedTabbedView = @getFocusedTabbedView();

    if focusedTabbedView != null
      focusedTabbedView.shiftRight();

  tabCountChanged: ->
    totalTabs = @leftTabbedView.getTabCount() + @rightTabbedView.getTabCount();
    @leftTabbedView.setTabsVisible(totalTabs > 2);
    @rightTabbedView.setTabsVisible(totalTabs > 2);

  fileSystemRemoved: (fileSystem) ->
    @leftTabbedView.fileSystemRemoved(fileSystem);
    @rightTabbedView.fileSystemRemoved(fileSystem);

  serverClosed: (server) ->
    @leftTabbedView.serverClosed(server);
    @rightTabbedView.serverClosed(server);

  serialize: ->
    state = {};

    state.left = @leftTabbedView.serialize();
    state.right = @rightTabbedView.serialize();
    state.height = @getLeftView().getContentHeight();

    return state;
