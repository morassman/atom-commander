fs = require 'fs-plus'
minimatch = require 'minimatch'
Scheduler = require 'nschedule';
{filter} = require 'fuzzaldrin'
{View, TextEditorView} = require 'atom-space-pen-views'
{CompositeDisposable, Directory} = require 'atom'
FileController = require '../controllers/file-controller'
DirectoryController = require '../controllers/directory-controller'
SymLinkController = require '../controllers/symlink-controller'
VFile = require '../fs/vfile'
VDirectory = require '../fs/vdirectory'
VSymLink = require '../fs/vsymlink'
Utils = require '../utils'
ListDirectoryView = require './list-directory-view';
# HistoryView = require './history-view';

module.exports =
class ContainerView extends View

  constructor: (@left) ->
    super();
    @itemViews = [];
    @directory = null;
    @directoryDisposable = null;
    @highlightedIndex = null;
    @timeSearchStarted = null;
    @timeKeyPressed = null;
    @showSpinnerCount = 0;
    @scheduler = new Scheduler(1);
    @disposables = new CompositeDisposable();
    @lastLocalPath = null;
    @sortBy = null;
    @sortAscending = true;

    @directoryEditor.addClass('directory-editor');

    # @disposables.add(atom.tooltips.add(@history, {title: 'History'}));

    if @left
      @username.addClass('left-username');
      # @history.addClass('left-history');
    else
      @username.addClass('right-username');
      # @history.addClass('right-history');

    @username.hide();

    @directoryEditor.focusout =>
      @directoryEditorCancel();

    @disposables.add atom.commands.add @directoryEditor[0],
      'core:confirm': => @directoryEditorConfirm()
      'core:cancel': => @directoryEditorCancel()

    @disposables.add atom.commands.add @containerView[0],
      'core:move-up': @moveUp.bind(this)
      'core:move-down': @moveDown.bind(this)
      'core:page-up': => @pageUp()
      'core:page-down': => @pageDown()
      'core:move-to-top': => @highlightFirstItem()
      'core:move-to-bottom': => @highlightLastItem()
      'core:cancel': => @escapePressed();
      'atom-commander:open-highlighted-item': => @openHighlightedItem(false)
      'atom-commander:open-highlighted-item-native': => @openHighlightedItem(true)
      'atom-commander:open-parent-folder': => @backspacePressed();
      'atom-commander:highlight-first-item': => @highlightFirstItem()
      'atom-commander:highlight-last-item': => @highlightLastItem()
      'atom-commander:page-up': => @pageUp()
      'atom-commander:page-down': => @pageDown()
      'atom-commander:select-item': => @spacePressed()

  @content: ->
    @div {tabindex: -1}, =>
      @div =>
        @span '', {class: 'highlight-info username', outlet: 'username'}
        # @span '', {class: 'history icon icon-clock', outlet: 'history', click: 'toggleHistory' }
        @subview 'directoryEditor', new TextEditorView(mini: true)
      @div {class: 'atom-commander-container-view', outlet: 'containerView'}, =>
        @container();
      @div {class: 'search-panel', outlet: 'searchPanel'}
      @div "Loading...", {class: 'loading-panel', outlet: 'spinnerPanel'}
      # @subview 'historyView', new HistoryView()

  isLeft: ->
    return @left;

  setMainView: (@mainView) ->
    @localFileSystem = @mainView.getMain().getLocalFileSystem();

  getMainView: ->
    return @mainView;

  setTabView: (@tabView) ->
    if @directory != null
      @tabView.directoryChanged();

  getTabView: ->
    return @tabView;

  getMain: ->
    return @mainView.getMain();

  getDirectory: ->
    return @directory;

  getFileSystem: ->
    return @directory.getFileSystem();

  getLastLocalPath: ->
    return @lastLocalPath;

  initialize: (state) ->
    @searchPanel.hide();
    @spinnerPanel.hide();

    # @historyView.setContainerView(@);

    if @left
      @addClass("left-container");

    @directoryEditor.addClass("directory-editor");
    @directoryEditor.on 'focus', (e) =>
      @mainView.focusedView = @;
      # @historyView.close();
      @mainView.getOtherView(@).refreshHighlight();
      @refreshHighlight();

    @on 'dblclick', '.item', (e) =>
      @requestFocus();
      @highlightIndex(e.currentTarget.index, false);
      @openHighlightedItem();

    @on 'mousedown', '.item', (e) =>
      @requestFocus();
      @highlightIndex(e.currentTarget.index, false);

    @keypress (e) => @handleKeyPress(e);

  toggleHistory: (e) ->
    e.stopPropagation();
    # @historyView.toggle();

  storeScrollTop: ->
    @scrollTop = @getScrollTop();

  restoreScrollTop: ->
    if @scrollTop?
      @setScrollTop(@scrollTop);

  getScrollTop: ->

  setScrollTop: (scrollTop) ->

  cancelSpinner: ->
    if @showSpinnerCount == 0
      return;

    @showSpinnerCount = 0;
    @spinnerPanel.hide();

  showSpinner: ->
    @showSpinnerCount++;
    @spinnerPanel.show();

  hideSpinner: ->
    @showSpinnerCount--;

    if @showSpinnerCount == 0
      @spinnerPanel.hide();

  escapePressed: ->
    if @searchPanel.isVisible()
      @searchPanel.hide();

  backspacePressed: ->
    if @searchPanel.isVisible()
      @timeKeyPressed = Date.now();
      @searchPanel.text(@searchPanel.text().slice(0, -1));
      @search(@searchPanel.text());
    else
      @openParentDirectory();

  spacePressed: ->
    if @searchPanel.isVisible()
      @timeKeyPressed = Date.now();
      @searchPanel.text(@searchPanel.text()+" ");
      @search(@searchPanel.text());
    else
      @selectItem();

  handleKeyPress: (e) ->
    if !@hasContainerFocus()
      return;

    # When Alt is down the menu is being shown.
    if e.altKey
      return;

    charCode = e.which | e.keyCode;
    sCode = String.fromCharCode(charCode);

    if @searchPanel.isHidden()
      if sCode == "+"
        @mainView.main.actions.selectAdd();
        return;
      else if sCode == "-"
        @mainView.main.actions.selectRemove();
        return;
      else if sCode == "*"
        @mainView.main.actions.selectInvert();
        return;
      else
        @showSearchPanel();
    else
      @timeKeyPressed = Date.now();

    @searchPanel.append(sCode);
    @search(@searchPanel.text());

  showSearchPanel: ->
    @timeSearchStarted = Date.now();
    @timeKeyPressed = @timeSearchStarted;
    @searchPanel.text("");
    @searchPanel.show();

    @scheduleTimer();

  scheduleTimer: ->
    @scheduler.add 1000, (done) =>
      currentTime = Date.now();
      hide = false;

      if @timeSearchStarted == @timeKeyPressed
        hide = true;
      else if ((currentTime - @timeKeyPressed) >= 1000)
        hide = true;

      done(@scheduler.STOP);

      if hide
        @searchPanel.hide();
      else
        @scheduleTimer();

  search: (text) ->
    results = filter(@itemViews, text, {key: 'itemName', maxResults: 1});
    if results.length > 0
      @highlightIndexWithName(results[0].itemName);

  getPath: ->
    if @directory == null
      return null;

    return @directory.getRealPathSync();

  getURI: ->
    if @directory == null
      return null;

    return @directory.getURI();

  # includeHighlightIfEmpty : true if the highlighted name should be included if nothing is selected.
  getSelectedNames: (includeHighlightIfEmpty=false)->
    paths = [];

    for itemView in @itemViews
      if itemView.selected
        paths.push(itemView.getName());

    if includeHighlightIfEmpty and (paths.length == 0) and (@highlightedIndex != null)
      itemView = @itemViews[@highlightedIndex];

      if itemView.isSelectable()
        paths.push(itemView.getName());

    return paths;

  getSelectedItemViews: (includeHighlightIfEmpty=false) ->
    paths = [];

    for itemView in @itemViews
      if itemView.selected
        paths.push(itemView);

    if includeHighlightIfEmpty and (paths.length == 0) and (@highlightedIndex != null)
      itemView = @itemViews[@highlightedIndex];

      if itemView.isSelectable()
        paths.push(itemView);

    return paths;

  getItemViewsWithPattern: (pattern) ->
    result = [];

    for itemView in @itemViews
      if minimatch(itemView.getName(), pattern, { dot: true, nocase: true})
        result.push(itemView);

    return result;

  requestFocus: ->
    @mainView.focusView(@);

  focus: ->
    @refreshHighlight();

  unfocus: ->
    atom.workspace.getActivePane().activate()
    @refreshHighlight();

  hasFocus: ->
    return @hasContainerFocus() or @directoryEditor.hasFocus();

  # Override and return whether the item container view has focus.
  hasContainerFocus: ->

  # Override to remove all item views.
  clearItemViews: ->

  # Override to create a new view for navigating to the parent directory.
  createParentView: (index, directoryController) ->

  # Override to creates and return a new view for the given item.
  createFileView: (index, fileController) ->

  createDirectoryView: (index, directoryController) ->

  createSymLinkView: (index, symLinkController) ->

  # Override to add the given item view.
  addItemView: (itemView) ->

  # Override to adjust the height of the content.
  adjustContentHeight: (change) ->

  # Override to return the height of the content.
  getContentHeight: ->

  # Override to set the height of the content.
  setContentHeight: (contentHeight) ->

  # Override to refresh the sort icons.
  refreshSortIcons: (sortBy, ascending) ->

  moveUp: (event) ->
    if @highlightedIndex != null
      @highlightIndex(@highlightedIndex-1);

  moveDown: (event) ->
    if @highlightedIndex != null
      @highlightIndex(@highlightedIndex+1);

  # Override
  pageUp: ->

  # Override
  pageDown: ->

  selectItem: ->
    if @highlightedIndex == null
      return;

    itemView = @itemViews[@highlightedIndex];
    itemView.toggleSelect();

    @highlightIndex(@highlightedIndex+1);

  highlightFirstItem: ->
    @highlightIndex(0);

  highlightLastItem: ->
    if @itemViews.length > 0
      @highlightIndex(@itemViews.length - 1);

  highlightIndex: (index, scroll=true) ->
    if @highlightedIndex != null
      @itemViews[@highlightedIndex].highlight(false, @hasFocus());

    if @itemViews.length == 0
      index = null;
    else if index < 0
      index = 0;
    else if index >= @itemViews.length
      index = @itemViews.length - 1;

    @highlightedIndex = index;
    @refreshHighlight(scroll);

  refreshHighlight: (scroll=false) ->
    if @highlightedIndex != null
      focused = @hasFocus();
      itemView = @itemViews[@highlightedIndex]
      itemView.highlight(true, focused);

      if focused and scroll
        itemView.scrollIntoViewIfNeeded(true)

  highlightIndexWithName: (name) ->
    itemView = @getItemViewWithName(name);

    if itemView != null
      @highlightIndex(itemView.index);

  getItemViewWithName: (name) ->
    for itemView in @itemViews
      if itemView.getName() == name
        return itemView;

    return null;

  getHighlightedItem: ->
    if @highlightedIndex == null
      return null;

    return @itemViews[@highlightedIndex];

  getHighlightedItemName: ->
    if @highlightedIndex == null
      return null;

    return @itemViews[@highlightedIndex].getName();

  openHighlightedItem: (isNative=false)->
    if @highlightedIndex == null
      return;

    if isNative
      @getMain().getActions().openSystem();
    else
      itemView = @itemViews[@highlightedIndex];
      itemView.performOpenAction();

  openLastLocalDirectory: ->
    @openDirectory(@getInitialDirectory(@lastLocalPath));

  openParentDirectory: ->
    if !@directory.isRoot()
      snapShot = {};
      snapShot.name = @directory.getBaseName();
      @openDirectory(@directory.getParent(), snapShot);

  openDirectory: (directory, snapShot = null, callback = null) ->
    if @searchPanel.isVisible()
      @searchPanel.hide();

    if directory instanceof Directory
      directory = @localFileSystem.getDirectory(directory.getRealPathSync());

    # if (@directory != null) and @directory.getPath() == directory.getPath()
    #   return;

    try
      @tryOpenDirectory(directory, snapShot, callback);
    catch error
      console.error(error);
      # If the directory couldn't be opened and one hasn't been opened yet then
      # revert to opening the home folder and finally the PWD.
      if (@directory == null) or !fs.isDirectorySync(@directory.getRealPathSync())
        try
          @tryOpenDirectory(@localFileSystem.getDirectory(fs.getHomeDirectory()), null, callback);
        catch error2
          @tryOpenDirectory(@localFileSystem.getDirectory(process.env['PWD']), null, callback);

  tryOpenDirectory: (newDirectory, snapShot = null, callback = null) ->
    @directory = newDirectory;
    @tabView?.directoryChanged();
    @cancelSpinner();
    @disableAutoRefresh();

    @resetItemViews();
    @highlightIndex(0);

    @getEntries(newDirectory, snapShot, callback);

    fileSystem = @directory.getFileSystem();
    @username.text(fileSystem.getUsername());

    if fileSystem.isLocal()
      @lastLocalPath = @directory.getPath();
      @username.hide();
    else
      @username.show();

  resetItemViews: ->
    @clearItemViews();

    @itemViews = [];
    @highlightedIndex = null;

    @directoryEditor.setText(@directory.getURI());

    if !@directory.isRoot()
      itemView = @createParentView(0, new DirectoryController(@directory.getParent()));
      @itemViews.push(itemView);
      @addItemView(itemView);

  refreshItemViews: ->
    for itemView in @itemViews
      itemView.refresh();

  getEntries: (newDirectory, snapShot, callback) ->
    @showSpinner();
    newDirectory.getEntries (newDirectory, err, entries) =>
      if err == null
        @entriesCallback(newDirectory, entries, snapShot, callback);
      else if !err.canceled?
        Utils.showErrorWarning("Error reading folder", null, err, null, false);
        callback?(err);
      else
        @openLastLocalDirectory();
      @hideSpinner();

  entriesCallback: (newDirectory, entries, snapShot, callback) ->
    if (@directory != null) and (@directory.getURI() != newDirectory.getURI())
      callback?(null);
      return;

    highlightIndex = 0;

    if @highlightedIndex != null
      highlightIndex = @highlightedIndex;

    @resetItemViews();

    index = @itemViews.length;

    for entry in entries
      if entry instanceof VFile
        itemView = @createFileView(index, new FileController(entry));
      else if entry instanceof VDirectory
        itemView = @createDirectoryView(index, new DirectoryController(entry));
      else if entry instanceof VSymLink
        itemView = @createSymLinkView(index, new SymLinkController(entry));
      else
        itemView = null;

      if itemView?
        @itemViews.push(itemView);
        # @addItemView(itemView);
        index++;

    if @itemViews.length > 0
      @highlightIndex(highlightIndex);

    @restoreSnapShot(snapShot);
    @enableAutoRefresh();
    @sort(true);
    callback?(null);

  disableAutoRefresh: ->
    if @directoryDisposable != null
      @directoryDisposable.dispose();
      @directoryDisposable = null;

  enableAutoRefresh: ->
    if @directoryDisposable != null
      return;

    try
      @directoryDisposable = @directory.onDidChange =>
        @refreshDirectory();

  selectNames: (names) ->
    for itemView in @itemViews
      if names.indexOf(itemView.getName()) > -1
        itemView.select(true);

  getNames: ->
    names = [];

    for itemView in @itemViews
      names.push(itemView.getName());

    return names;

  refreshDirectory: ->
    @refreshDirectoryWithSnapShot(@captureSnapShot());

  refreshDirectoryWithSnapShot: (snapShot) ->
    @openDirectory(@directory, snapShot);

  captureSnapShot: ->
    snapShot = {};

    snapShot.index = @highlightedIndex;
    snapShot.name = @getHighlightedItemName();
    snapShot.selectedNames = @getSelectedNames();

    return snapShot;

  restoreSnapShot: (snapShot) ->
    if !snapShot?
      return;

    index = snapShot.index;

    if snapShot.name?
      # If the item with the name still exists then highlight it, otherwise highlight the index.
      itemView = @getItemViewWithName(snapShot.name);

      if itemView != null
        index = itemView.index;

    if index?
      @highlightIndex(index);

    if snapShot.selectedNames?
      @selectNames(snapShot.selectedNames);

  setDirectory: (path) ->
    if !fs.isDirectorySync(path)
      return;

    @directoryEditor.setText(path);
    @directoryEditorConfirm();

  directoryEditorConfirm: ->
    uri = @directoryEditor.getText().trim();

    if fs.isDirectorySync(uri)
      @openDirectory(@localFileSystem.getDirectory(uri), null, () => @focus());
      return;
    else if fs.isFileSync(uri)
      file = @localFileSystem.getFile(uri);
      @mainView.main.actions.goFile(file, true);
      return;

    fileSystem = @directory.getFileSystem();

    if fileSystem.isLocal()
      return;

    path = fileSystem.getPathFromURI(uri);

    if path != null
      @openDirectory(fileSystem.getDirectory(path), null, () => @focus());

    # # TODO : The file system may change.
    # directory = @directory.fileSystem.getDirectory(@directoryEditor.getText().trim());
    #
    # if directory.existsSync() and directory.isDirectory()
    #   @openDirectory(directory);

  directoryEditorCancel: ->
    @directoryEditor.setText(@directory.getURI());

  addProject: ->
    @addRemoveProject(true);

  removeProject: ->
    @addRemoveProject(false);

  addRemoveProject: (add) ->
    if @directory == null
      return;

    if !@directory.fileSystem.isLocal()
      atom.notifications.addWarning("Remote project folders are not yet supported.");
      return;

    selectedItemViews = @getSelectedItemViews(true);
    directories = [];

    for selectedItemView in selectedItemViews
      if selectedItemView.isSelectable() and (selectedItemView.itemController instanceof DirectoryController)
        directories.push(selectedItemView.itemController.getDirectory());

    if directories.length == 0
      if add
        atom.project.addPath(@directory.getPath());
      else
        atom.project.removePath(@directory.getPath());
    else
      for directory in directories
        if add
          atom.project.addPath(directory.getPath());
        else
          atom.project.removePath(directory.getPath());

  selectAll: ->
    for itemView in @itemViews
      if itemView.isSelectable()
        itemView.select(true);

  selectNone: ->
    for itemView in @itemViews
      if itemView.isSelectable()
        itemView.select(false);

  selectInvert: ->
    for itemView in @itemViews
      if itemView.isSelectable()
        itemView.toggleSelect();

  getInitialDirectory: (suggestedPath) ->
    if suggestedPath? and fs.isDirectorySync(suggestedPath)
      return @localFileSystem.getDirectory(suggestedPath);

    directories = atom.project.getDirectories();

    if directories.length > 0
      return @localFileSystem.getDirectory(directories[0].getRealPathSync());

    return @localFileSystem.getDirectory(fs.getHomeDirectory());

  fileSystemRemoved: (fileSystem) ->
    if @directory.getFileSystem() == fileSystem
      @openDirectory(@getInitialDirectory(@lastLocalPath));

  serverClosed: (server) ->
    if @directory.getFileSystem() == server.getFileSystem()
      @openDirectory(@getInitialDirectory(@lastLocalPath));

  isSizeColumnVisible: ->
    return @getMainView().isSizeColumnVisible();

  isDateColumnVisible: ->
    return @getMainView().isDateColumnVisible();

  isExtensionColumnVisible: ->
    return @getMainView().isExtensionColumnVisible();

  setSizeColumnVisible: (visible) ->

  setDateColumnVisible: (visible) ->

  setExtensionColumnVisible: (visible) ->

  setSortBy: (sortBy) ->
    if @sortBy == sortBy
      if sortBy == null
        return;
      @sortAscending = !@sortAscending
    else
      @sortBy = sortBy;
      @sortAscending = true;

    if sortBy == null
      @refreshDirectory();
    else
      @sort(true);

  sort: (scrollToHighlight=false) ->
    if @itemViews.length == 0
      return;

    prevHighlightIndex = @highlightedIndex;
    @highlightIndex(null, false);
    @clearItemViews();

    # Separate files and directories.
    parentItemView = null;
    dirItemViews = [];
    fileItemViews = [];

    for itemView in @itemViews
      item = itemView.getItem();

      if item.isFile()
        fileItemViews.push(itemView);
      else if item.isDirectory()
        if itemView.isForParentDirectory()
          parentItemView = itemView;
        else
          dirItemViews.push(itemView);

    Utils.sortItemViews(true, dirItemViews, @sortBy, @sortAscending);
    Utils.sortItemViews(false, fileItemViews, @sortBy, @sortAscending);

    @itemViews = [];

    if parentItemView?
      @itemViews.push(parentItemView);

    @itemViews = @itemViews.concat(dirItemViews);
    @itemViews = @itemViews.concat(fileItemViews);

    index = 0;
    newHighlightIndex = null;

    for itemView in @itemViews
      if !newHighlightIndex? and itemView.index == prevHighlightIndex
        newHighlightIndex = index;
      itemView.index = index++;
      @addItemView(itemView);

    @highlightIndex(newHighlightIndex, scrollToHighlight);
    @refreshSortIcons(@sortBy, @sortAscending);

  deserialize: (path, state) ->
    if !state?
      @openDirectory(@getInitialDirectory(path));
      return;

    @sortBy = state.sortBy;
    @sortAscending = state.sortAscending;

    if !@sortBy?
      @sortBy = null;

    if !@sortAscending?
      @sortAscending = true;

    snapShot = {}
    snapShot.name = state.highlight;
    @openDirectory(@getInitialDirectory(state.path), snapShot);

    # if state.highlight?
    #   @highlightIndexWithName(state.highlight);

  serialize: ->
    state = {}
    state.sortBy = @sortBy;
    state.sortAscending = @sortAscending;

    if @directory.isLocal()
      state.path = @getPath();
      state.highlight = @getHighlightedItemName();
    else
      state.path = @lastLocalPath;

    return state;

  dispose: ->
    @disposables.dispose();
