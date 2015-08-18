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
      @container();

  initialize: (state) ->
    @on 'dblclick', '.item', (e) =>
      @requestFocus();
      @highlightIndex(e.currentTarget.index);
      @openHighlightedItem();

    @on 'click', '.item', (e) =>
      @requestFocus();
      @highlightIndex(e.currentTarget.index);

    atom.commands.add @element,
     'core:move-up': @moveUp.bind(this)
     'core:move-down': @moveDown.bind(this)
     'core:page-up': => @pageUp()
     'core:page-down': => @pageDown()
     'core:move-to-top': => @scrollToTop()
     'core:move-to-bottom': => @scrollToBottom()
     'atom-commander:open-highlighted-item': => @openHighlightedItem()
     'atom-commander:open-parent-directory': => @openParentDirectory()
     'atom-commander:highlight-first-item': => @highlightFirstItem()
     'atom-commander:highlight-last-item': => @highlightLastItem()
     'atom-commander:page-up': => @pageUp()
     'atom-commander:page-down': => @pageDown()

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

  highlightFirstItem: ->
    @highlightIndex(0);

  highlightLastItem: ->
    if @itemViews.length > 0
      @highlightIndex(@itemViews.length - 1);

  highlightIndex: (index) ->
    if @highlightedIndex != null
      @itemViews[@highlightedIndex].highlight(false);

    if @itemViews.length == 0
      index = null;
    else if index < 0
      index = 0;
    else if index >= @itemViews.length
      index = @itemViews.length - 1;

    @highlightedIndex = index;
    @refreshHighlight();

  refreshHighlight: ->
    if @highlightedIndex != null
      itemView = @itemViews[@highlightedIndex]

      if @hasFocus()
        itemView.highlight(true);
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
      try
        @tryOpenDirectory(new Directory(process.env['HOME']));
      catch error2
        @tryOpenDirectory(new Directory(process.env['PWD']));

  tryOpenDirectory: (@directory) ->
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

    for entry in @directory.getEntriesSync()
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

  refreshDirectory: ->
    @openDirectory(@directory);
    # TODO : Highlight the previously highlighted item.

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
