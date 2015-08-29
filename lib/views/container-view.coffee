fs = require 'fs-plus'
minimatch = require 'minimatch'
Scheduler = require 'nschedule';
{filter} = require 'fuzzaldrin'
{View, TextEditorView} = require 'atom-space-pen-views'
{CompositeDisposable, Directory, File} = require 'atom'
FileController = require '../controllers/file-controller'
DirectoryController = require '../controllers/directory-controller'

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
    @scheduler = new Scheduler(1);
    @disposables = new CompositeDisposable();

    @directoryEditor.addClass('directory-editor');

    @directoryEditor.focusout =>
      @directoryEditorCancel();

    @disposables.add atom.commands.add @directoryEditor.element,
      'core:confirm': => @directoryEditorConfirm()
      'core:cancel': => @directoryEditorCancel()

  setMainView: (@mainView) ->

  @content: ->
    @div {class: 'tool-panel'}, =>
      @subview 'directoryEditor', new TextEditorView(mini: true)
      @div {class: 'atom-commander-container-view'}, =>
        @container();
      @div {class: 'search-panel', outlet: 'searchPanel'}

  initialize: (state) ->
    @searchPanel.hide();

    @on 'dblclick', '.item', (e) =>
      @requestFocus();
      @highlightIndex(e.currentTarget.index, false);
      @openHighlightedItem();

    @on 'mousedown', '.item', (e) =>
      @requestFocus();
      @highlightIndex(e.currentTarget.index, false);

    @keypress (e) => @handleKeyPress(e);

    atom.commands.add @element,
     'core:move-up': @moveUp.bind(this)
     'core:move-down': @moveDown.bind(this)
     'core:page-up': => @pageUp()
     'core:page-down': => @pageDown()
     'core:move-to-top': => @scrollToTop()
     'core:move-to-bottom': => @scrollToBottom()
     'core:cancel': => @escapePressed();
     'atom-commander:open-highlighted-item': => @openHighlightedItem()
     'atom-commander:open-parent-folder': => @backspacePressed();
     'atom-commander:highlight-first-item': => @highlightFirstItem()
     'atom-commander:highlight-last-item': => @highlightLastItem()
     'atom-commander:page-up': => @pageUp()
     'atom-commander:page-down': => @pageDown()
     'atom-commander:select-item': => @spacePressed()

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

  getSelectedItemViews: (includeHighlightIfEmpty=false)->
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

  # Override and return whether view has focus.
  hasFocus: ->

  # Override to remove all item views.
  clearItemViews: ->

  # Override to create a new view for navigating to the parent directory.
  createParentView: (index, directoryController) ->

  # Override to creates and return a new view for the given item.
  createFileView: (index, fileController) ->

  createDirectoryView: (index, directoryController) ->

  # Override to add the given item view.
  addItemView: (itemView) ->

  # Override to adjust the height of the content.
  adjustContentHeight: (change) ->

  # Override to return the height of the content.
  getContentHeight: ->

  # Override to set the height of the content.
  setContentHeight: (contentHeight) ->

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

  openHighlightedItem: ->
    if @highlightedIndex == null
      return;

    itemView = @itemViews[@highlightedIndex];
    itemView.performOpenAction();

  openParentDirectory: ->
    if !@directory.isRoot()
      name = @directory.getBaseName();
      @openDirectory(@directory.getParent());
      @highlightIndexWithName(name);

  openDirectory: (directory) ->
    if @searchPanel.isVisible()
      @searchPanel.hide();

    # if (@directory != null) and @directory.getPath() == directory.getPath()
    #   return;

    try
      @tryOpenDirectory(directory);
    catch error
      # If the directory couldn't be opened and one hasn't been opened yet then
      # revert to opening the home folder and finally the PWD.
      if (@directory == null) or !fs.isDirectorySync(@directory.getRealPathSync())
        try
          @tryOpenDirectory(new Directory(fs.getHomeDirectory()));
        catch error2
          @tryOpenDirectory(new Directory(process.env['PWD']));

  tryOpenDirectory: (newDirectory) ->
    if !fs.isDirectorySync(newDirectory.getRealPathSync())
      throw new Error("Invalid path.");

    # The following will throw an error if the entries could not be read. It
    # is done here in order to prevent the rest from happening if the directory
    # cannot be read.
    entries = newDirectory.getEntriesSync();

    #If the directory could be read then update the field.
    @directory = newDirectory;

    if @directoryDisposable
      @directoryDisposable.dispose();
      @directoryDisposable = null;

    @clearItemViews();

    @itemViews = [];
    @highlightedIndex = null;
    index = 0;

    @directoryEditor.setText(@directory.getPath());

    if !@directory.isRoot()
      itemView = @createParentView(index, new DirectoryController(@directory.getParent()));
      @itemViews.push(itemView);
      @addItemView(itemView);
      index++;

    for entry in entries
      if entry instanceof File
        itemView = @createFileView(index, new FileController(entry));
      else
        itemView = @createDirectoryView(index, new DirectoryController(entry));

      @itemViews.push(itemView);
      @addItemView(itemView);
      index++;

    if @itemViews.length > 0
      @highlightIndex(0);

    @directoryDisposable = @directory.onDidChange =>
      @refreshDirectory();

  selectNames: (names) ->
    for itemView in @itemViews
      if names.indexOf(itemView.getName()) > -1
        itemView.select(true);

  refreshDirectory: ->
    # Remember both the index and the name.
    index = @highlightedIndex;
    name = @getHighlightedItemName();
    selectedNames = @getSelectedNames();

    @openDirectory(@directory);

    # If the item with the name still exists then highlight it, otherwise highlight the index.
    itemView = @getItemViewWithName(name);

    if itemView != null
      index = itemView.index;

    @highlightIndex(index);
    @selectNames(selectedNames);

  directoryEditorConfirm: ->
    directory = new Directory(@directoryEditor.getText().trim());

    if directory.existsSync() and directory.isDirectory()
      @openDirectory(directory);

  directoryEditorCancel: ->
    @directoryEditor.setText(@directory.getPath());

  addProject: ->
    if @directory == null
      return;

    selectedItemViews = @getSelectedItemViews(true);
    directories = [];

    for selectedItemView in selectedItemViews
      if selectedItemView.isSelectable() and (selectedItemView.itemController instanceof DirectoryController)
        directories.push(selectedItemView.itemController.getDirectory());

    if directories.length == 0
      atom.project.addPath(@directory.getPath());
    else
      for directory in directories
        atom.project.addPath(directory.getPath());

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
      return new Directory(suggestedPath);

    directories = atom.project.getDirectories();

    if directories.length > 0
      return directories[0];

    return new Directory(fs.getHomeDirectory());

  deserialize: (path, state) ->
    if (state == null) or (state == undefined)
      @openDirectory(@getInitialDirectory(path));
      return;

    @openDirectory(@getInitialDirectory(state.path));
    @highlightIndexWithName(state.highlight);

  serialize: ->
    state = {}

    state.path = @getPath();
    state.highlight = @getHighlightedItemName();

    return state;

  dispose: ->
    @disposables.dispose();
