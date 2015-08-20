fs = require 'fs-plus'
{View, TextEditorView} = require 'atom-space-pen-views'
{CompositeDisposable, Directory, File} = require 'atom'
FileController = require '../controllers/file-controller'
DirectoryController = require '../controllers/directory-controller'

module.exports =
class ContainerView extends View

  constructor: ->
    super();
    @itemViews = [];
    @directory = null;
    @directoryDisposable = null;
    @highlightedIndex = null;
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
      @div {class: 'container-view'}, =>
        @container();

  initialize: (state) ->
    @on 'dblclick', '.item', (e) =>
      @requestFocus();
      @highlightIndex(e.currentTarget.index, false);
      @openHighlightedItem();

    @on 'click', '.item', (e) =>
      @requestFocus();
      @highlightIndex(e.currentTarget.index, false);

    atom.commands.add @element,
     'core:move-up': @moveUp.bind(this)
     'core:move-down': @moveDown.bind(this)
     'core:page-up': => @pageUp()
     'core:page-down': => @pageDown()
     'core:move-to-top': => @scrollToTop()
     'core:move-to-bottom': => @scrollToBottom()
     'atom-commander:open-highlighted-item': => @openHighlightedItem()
     'atom-commander:open-parent-folder': => @openParentDirectory()
     'atom-commander:highlight-first-item': => @highlightFirstItem()
     'atom-commander:highlight-last-item': => @highlightLastItem()
     'atom-commander:page-up': => @pageUp()
     'atom-commander:page-down': => @pageDown()
     'atom-commander:select-item': => @selectItem();

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
      @itemViews[@highlightedIndex].highlight(false);

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
      itemView = @itemViews[@highlightedIndex]

      if @hasFocus()
        itemView.highlight(true);

        if scroll
          itemView.scrollIntoViewIfNeeded(true)
      else
        itemView.highlight(false);

  highlightIndexWithName: (name) ->
    itemView = @getItemViewWithName(name);

    if itemView != null
      @highlightIndex(itemView.index);

  getItemViewWithName: (name) ->
    for itemView in @itemViews
      if itemView.getName() == name
        return itemView;

    return null;

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
    try
      @tryOpenDirectory(directory);
    catch error
      # If the directory couldn't be opened and one hasn't been opened yet then
      # revert to opening the home folder and finally the PWD.
      if @directory == null
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

  getSelectedNames: ->
    selectedNames = [];

    for itemView in @itemViews
      if itemView.selected
        selectedNames.push(itemView.getName());

    return selectedNames;

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
    if @directory != null
      atom.project.addPath(@directory.getPath());

  dispose: ->
    @disposables.dispose();
