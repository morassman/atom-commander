fs = require 'fs-plus'
{Directory, Task} = require 'atom'
{$, View} = require 'atom-space-pen-views'
ListView = require './views/list-view'
MenuBarView = require './views/menu/menu-bar-view'
NewFileDialog = require './dialogs/new-file-dialog'
NewDirectoryDialog = require './dialogs/new-directory-dialog'
RenameDialog = require './dialogs/rename-dialog'
DuplicateFileDialog = require './dialogs/duplicate-file-dialog'
FileController = require './controllers/file-controller'
DirectoryController = require './controllers/directory-controller'
FTPFileSystem = require './fs/ftp/ftp-filesystem'
Utils = require './utils'
TabbedView = require './views/tabbed-view'

module.exports =
class AtomCommanderView extends View

  @ATOM_COMMANDER_URI = 'atom://atom-commander'

  constructor: (@main, state)->
    super(@main);

    @alternateButtons = false;
    @sizeColumnVisible = state.sizeColumnVisible;
    @dateColumnVisible = state.dateColumnVisible;
    @extensionColumnVisible = state.extensionColumnVisible;

    if !@sizeColumnVisible?
      @sizeColumnVisible = false;

    if !@dateColumnVisible?
      @dateColumnVisible = false;

    if !@extensionColumnVisible?
      @extensionColumnVisible = true;

    @menuBar.setMainView(@);
    @leftTabbedView.setMainView(@);
    @rightTabbedView.setMainView(@);

    @leftTabbedView.addClass('left');
    @rightTabbedView.addClass('right');

    @leftTabbedView.deserialize(state.version, state.leftPath, state.left);
    @rightTabbedView.deserialize(state.version, state.rightPath, state.right);

    @leftView = @leftTabbedView.getSelectedView();
    @rightView = @rightTabbedView.getSelectedView();

    @horizontal = true;
    @customHeight = state.height;

    if !atom.config.get('atom-commander.panel.showInDock')
      @setHeight(state.height);

    @focusedView = @getLeftView();

  @content: ->
    buttonStyle = '';

    @div {class: 'atom-commander'}, =>
      @div class: 'atom-commander-resize-handle', outlet: 'resizeHandle'
      @subview 'menuBar', new MenuBarView();
      @div {class: 'content', outlet: 'contentView'}, =>
        @subview 'leftTabbedView', new TabbedView(true)
        @subview 'rightTabbedView', new TabbedView(false)
      @div {tabindex: -1, class: 'atom-commander-button-bar btn-group-xs'}, =>
        @button {tabindex: -1, class: 'btn', style: buttonStyle, click: 'menuButton'}, =>
          @span 'Alt', {class: 'key text-highlight'}
          @span 'Menu'
        @button {tabindex: -1, class: 'btn', style: buttonStyle, click: 'renameButton'}, =>
          @span 'F2', {class: 'key text-highlight'}
          @span 'Rename'
        @button {tabindex: -1, class: 'btn', style: buttonStyle, click: 'addRemoveProjectButton'}, =>
          @span 'F3', {class: 'key text-highlight'}
          @span 'Add Project', {outlet: 'F3ButtonLabel'}
        @button {tabindex: -1, class: 'btn', style: buttonStyle, click: 'newFileButton'}, =>
          @span 'F4', {class: 'key text-highlight'}
          @span 'New File'
        @button {tabindex: -1, class: 'btn', style: buttonStyle, click: 'copyDuplicateButton'}, =>
          @span 'F5', {class: 'key text-highlight'}
          @span 'Copy', {outlet: 'F5ButtonLabel'}
        @button {tabindex: -1, class: 'btn', style: buttonStyle, click: 'moveButton'}, =>
          @span 'F6', {class: 'key text-highlight'}
          @span 'Move'
        @button {tabindex: -1, class: 'btn', style: buttonStyle, click: 'newDirectoryButton'}, =>
          @span 'F7', {class: 'key text-highlight'}
          @span 'New Folder'
        @button {tabindex: -1, class: 'btn', style: buttonStyle, click: 'deleteButton'}, =>
          @span 'F8', {class: 'key text-highlight'}
          @span 'Delete'
        @button {tabindex: -1, class: 'btn', style: buttonStyle, click: 'focusButton'}, =>
          @span 'F9', {class: 'key text-highlight'}
          @span 'Focus'
        @button {tabindex: -1, class: 'btn', style: buttonStyle, click: 'hideButton'}, =>
          @span 'F10', {class: 'key text-highlight'}
          @span 'Hide'
        @button {tabindex: -1, class: 'btn', style: buttonStyle, click: 'shiftButton'}, =>
          @span 'Shift', {class: 'key text-highlight'}
          @span 'More...'

  initialize: ->
    @menuBar.hide();

    atom.commands.add @element,
      'atom-commander:focus-other-view': => @focusOtherView()
      'atom-commander:rename': => @renameButton();
      'atom-commander:add-project': => @addProjectButton();
      'atom-commander:remove-project': => @removeProjectButton();
      'atom-commander:new-file': => @newFileButton();
      'atom-commander:copy': => @copyButton();
      'atom-commander:duplicate': => @duplicateButton();
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
      'atom-commander:copy-paths': => @copyPaths(false);
      'atom-commander:copy-path-names': => @copyPaths(true);

    if atom.config.get('atom-commander.panel.showInDock')
      @resizeHandle.hide();

    @on 'mousedown', '.atom-commander-resize-handle', (e) => @resizeStarted(e);

    @keyup (e) => @handleKeyUp(e);
    @keydown (e) => @handleKeyDown(e);
    @keypress (e) => @handleKeyPress(e);

  destroy: ->
    @leftView.dispose();
    @rightView.dispose();
    @menuBar.dispose();
    @element.remove();

  getTitle: ->
    return 'Atom Commander';

  getURI: ->
    return AtomCommanderView.ATOM_COMMANDER_URI;

  getPreferredLocation: ->
    return 'bottom';

  getAllowedLocations: ->
    return ['bottom', 'left', 'right'];

  isPermanentDockItem: ->
    return false;

  getElement: ->
    return @element;

  handleKeyDown: (e) ->
    if e.altKey and !e.ctrlKey and !e.metaKey and @menuBar.isHidden()
      @showMenuBar();
      e.preventDefault();
      e.stopPropagation();
    else if @menuBar.isVisible()
      @menuBar.handleKeyDown(e);
      e.preventDefault();
      e.stopPropagation();
    else if e.shiftKey
      @showAlternateButtons();

  handleKeyUp: (e) ->
    if e.altKey
      @menuBar.handleKeyUp(e);
      e.preventDefault();
      e.stopPropagation();
    else if @menuBar.isVisible()
      @hideMenuBar();
      e.preventDefault();
      e.stopPropagation();
    else if !e.shiftKey
      @hideAlternateButtons();

  handleKeyPress: (e) ->
    if @menuBar.isVisible()
      @menuBar.handleKeyUp(e);
      e.preventDefault();
      e.stopPropagation();

  toggleMenuBar: ->
    if @menuBar.isVisible()
      @hideMenuBar();
    else
      @showMenuBar();

  showMenuBar: ->
    @menuBar.reset();
    @menuBar.show();

  hideMenuBar: ->
    @menuBar.hide();
    @menuBar.reset();
    @refocusLastView();

  toggleAlternateButtons: ->
    if @alternateButtons
      @hideAlternateButtons();
    else
      @showAlternateButtons();

  showAlternateButtons: ->
    @alternateButtons = true;
    @F3ButtonLabel.text("Remove Project");
    @F5ButtonLabel.text("Duplicate");

  hideAlternateButtons: ->
    @alternateButtons = false;
    @F3ButtonLabel.text("Add Project");
    @F5ButtonLabel.text("Copy");

  resizeStarted: =>
    $(document).on('mousemove', @resizeView)
    $(document).on('mouseup', @resizeStopped)

  resizeStopped: =>
    $(document).off('mousemove', @resizeView)
    $(document).off('mouseup', @resizeStopped)

  resizeView: ({pageY, which}) =>
    return @resizeStopped() unless which is 1

    change = @offset().top - pageY;
    @setHeight(@outerHeight() + change);

  setHeight: (@customHeight) ->
    if !@customHeight?
      @customHeight = 200;
    else if @customHeight < 50
      @customHeight = 50;

    @height(@customHeight);

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

  setHorizontal: (horizontal) ->
    @horizontal = horizontal;

    if @horizontal
      @contentView.addClass('content-horizontal');
      @contentView.removeClass('content-vertical');
    else
      @contentView.addClass('content-vertical');
      @contentView.removeClass('content-horizontal');

    @getLeftView().setHorizontal(horizontal);
    @getRightView().setHorizontal(horizontal);

    @applyVisibility();

  focusView: (@focusedView) ->
    otherView = @getOtherView(@focusedView);
    otherView.unfocus();
    @applyVisibility();
    @focusedView.focus();

  showInDockChanged: (height) ->
    # TODO : Call this when toggling docked mode without recreating main view.

    # if atom.config.get('atom-commander.panel.showInDock')
    #   @height('100%')
    #   @resizeHandle.hide();
    #   @applyVisibility();
    # else
    #   @height(height);
    #   @resizeHandle.show();
    #   @setHorizontal(true);

  applyVisibility: ->
    onlyOne = atom.config.get('atom-commander.panel.onlyOneWhenVertical');

    if @horizontal or !onlyOne
      @leftTabbedView.show();
      @rightTabbedView.show();
      return;

    if @getRightView() == @focusedView
      @leftTabbedView.hide();
      @rightTabbedView.show();
    else
      @leftTabbedView.show();
      @rightTabbedView.hide();

  focusOtherView: ->
    if @getLeftView().hasFocus()
      @focusView(@getRightView());
    else
      @focusView(@getLeftView());

  addRemoveProjectButton: ->
    if @alternateButtons
      @removeProjectButton();
    else
      @addProjectButton();

  addProjectButton: ->
    if @focusedView != null
      @focusedView.addProject();

  removeProjectButton: ->
    if @focusedView != null
      @focusedView.removeProject();

  getFocusedViewDirectory: ->
    if @focusedView == null
      return null;

    return @focusedView.directory;

  menuButton: ->
    @toggleMenuBar();

  shiftButton: ->
    @toggleAlternateButtons();

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

    dialog = new NewFileDialog(@focusedView, directory, @focusedView.getNames());
    dialog.attach();

  copyDuplicateButton: ->
    if @alternateButtons
      @duplicateButton();
    else
      @copyButton();

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
        atom.notifications.addWarning("Move to/from remote file systems is not yet supported.");
        return;
    else if srcFileSystem.isRemote() and dstFileSystem.isRemote()
      atom.notifications.addWarning("Copy between remote file systems is not yet supported.");
      return;

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

  duplicateButton: ->
    if @focusedView == null
      return;

    fileSystem = @focusedView.directory.fileSystem;

    if fileSystem.isRemote()
      atom.notifications.addWarning("Duplicate on remote file systems is not yet supported.");
      return;

    itemView = @focusedView.getHighlightedItem();

    if (itemView == null) or !itemView.isSelectable()
      return;

    item = itemView.getItem();

    if item.isFile() or item.isDirectory()
      dialog = new DuplicateFileDialog(@focusedView, item);
      dialog.attach();

  deleteButton: ->
    if @focusedView == null
      return;

    # Create a local variable of the focused view in case the focus changes while deleting.
    view = @focusedView;
    itemViews = view.getSelectedItemViews(true);

    if itemViews.length == 0
      return;

    detailedMessage = "Delete the selected items?";

    if itemViews.length == 1
      itemView = itemViews[0];

      if itemView.getItem().isFile()
        detailedMessage = "Delete the file '" + itemView.getName() + "'?";
      else
        detailedMessage = "Delete the folder '" + itemView.getName() + "'?";

    option = atom.confirm
      message: "Delete"
      detailedMessage: detailedMessage
      buttons: ["No", "Yes"]

    if option == 0
      return;

    index = 0;
    callback = (err) =>
      if err?
        title = "Error deleting " + itemViews[index].getItem().getPath();
        post = null;
        if itemViews[index].getItem().isDirectory()
          post = "Make sure the folder is empty before deleting it.";
        Utils.showErrorWarning(title, null, post, err, true);

      index++;

      if index == itemViews.length
        @focusedView.refreshDirectory();
      else
        itemViews[index].getItem().delete(callback);

    itemViews[0].getItem().delete(callback);

  newDirectoryButton: ->
    directory = @getFocusedViewDirectory();

    if directory == null
      return;

    dialog = new NewDirectoryDialog(@focusedView, directory);
    dialog.attach();

  focusButton: ->
    @main.toggleFocus();

  hideButton: ->
    @main.hide();

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

  copyPaths: (namesOnly) ->
    if @focusedView != null
      itemViews = @focusedView.getSelectedItemViews(true);
      if itemViews.length > 0
        if namesOnly
          paths = itemViews.map (i) -> i.getName();
        else
          paths = itemViews.map (i) -> i.getPath();
        text = paths.join('\n');
        atom.clipboard.write(text);
        if paths.length == 1
          if namesOnly
            atom.notifications.addInfo('Copied name \'' + paths[0] + '\' to clipboard.');
          else
            atom.notifications.addInfo('Copied path \'' + paths[0] + '\' to clipboard.');
        else
          if namesOnly
            atom.notifications.addInfo('Copied ' + paths.length + ' names to clipboard.');
          else
            atom.notifications.addInfo('Copied ' + paths.length + ' paths to clipboard.');

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

  isSizeColumnVisible: ->
    return @sizeColumnVisible;

  isDateColumnVisible: ->
    return @dateColumnVisible;

  isExtensionColumnVisible: ->
    return @extensionColumnVisible;

  toggleSizeColumn: ->
    @sizeColumnVisible = !@sizeColumnVisible;
    @leftTabbedView.setSizeColumnVisible(@sizeColumnVisible);
    @rightTabbedView.setSizeColumnVisible(@sizeColumnVisible);

  toggleDateColumn: ->
    @dateColumnVisible = !@dateColumnVisible;
    @leftTabbedView.setDateColumnVisible(@dateColumnVisible);
    @rightTabbedView.setDateColumnVisible(@dateColumnVisible);

  toggleExtensionColumn: ->
    @extensionColumnVisible = !@extensionColumnVisible;
    @leftTabbedView.setExtensionColumnVisible(@extensionColumnVisible);
    @rightTabbedView.setExtensionColumnVisible(@extensionColumnVisible);

  setSortBy: (sortBy) ->
    if @focusedView != null
      @focusedView.setSortBy(sortBy);

  serialize: ->
    state = {};

    state.left = @leftTabbedView.serialize();
    state.right = @rightTabbedView.serialize();
    state.sizeColumnVisible = @sizeColumnVisible;
    state.dateColumnVisible = @dateColumnVisible;
    state.extensionColumnVisible = @extensionColumnVisible;
    state.height = @customHeight;

    return state;
