FSItem = require '../model/fs-item'
{View} = require 'atom-space-pen-views'
{Directory, File} = require 'atom'
FileController = require '../controllers/file-controller'
DirectoryController = require '../controllers/directory-controller'

module.exports =
class ContainerView extends View

  constructor: ->
    super();
    @itemViews = [];
    @directory = null;
    @highlightedIndex = null;

  @content: ->

  initialize: (state) ->
    @on 'click', '.item', (e) =>
      @focus();
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

  focus: ->
    @tableBody.focus()

  unfocus: ->
    atom.workspace.getActivePane().activate()

  hasFocus: ->
    return @tableBody.is(':focus') or document.activeElement is @tableBody[0]

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

    if @highlightedIndex != null
      itemView = @itemViews[@highlightedIndex]
      itemView.highlight(true);
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

  openDirectory: (@directory) ->
    @clearItemViews();

    @itemViews = [];
    @highlightedIndex = null;
    index = 0;

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
