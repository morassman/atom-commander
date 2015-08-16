ItemView = require './item-view'
FSItem = require '../model/fs-item'
{Directory, File} = require 'atom'
{$, $$, View} = require 'atom-space-pen-views'

module.exports =
class ListView extends View

  constructor: ->
    super();
    @itemViews = [];
    @directory = null;
    @highlightedIndex = null;

  @content: ->
    @div {class: 'list-view-resizer tool-panel', click:'focus'}, =>
      @div {class: 'list-view-scroller'}, =>
        @table {class: 'list-view-table'}, =>
          @tbody {class: 'list-view list focusable-panel', tabindex: -1, outlet: 'tableBody'}

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
    @tableBody.is(':focus') or document.activeElement is @tableBody[0]

  toggleFocus: ->
    if @hasFocus()
      @unfocus()
    else
      @show()

  setItems: (@items) ->
    @itemViews = [];
    @highlightedIndex = null;

    @tableBody.empty();
    @tableBody.append($(@createHeaderView()));

    index = 0;
    for item in @items
      itemView = new ItemView();
      itemView.initialize(index, item);
      @itemViews.push(itemView);
      @tableBody[0].appendChild(itemView);
      index++;

    if @items.length > 0
      @highlightIndex(0);

  createHeaderView: ->
    return """
      <tr>
        <th>Name</th>
        <th>Extension</th>
      </tr>
    """;

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
      if itemView.item.getName() == name
        return itemView;

    return null;

  openHighlightedItem: ->
    if @highlightedIndex == null
      return;

    itemView = @itemViews[@highlightedIndex];

    if itemView.item.isFile()
      @openFile(itemView.item.item);
    else if itemView.item.isDirectory()
      @openDirectory(itemView.item.getDirectory());

  openFile: (file) ->
    atom.workspace.open(file.getPath());

  openParentDirectory: ->
    if !@directory.isRoot()
      name = @directory.getBaseName();
      @openDirectory(@directory.getParent());
      @highlightIndexWithName(name);

  openDirectory: (@directory) ->
    entries = @directory.getEntriesSync();
    fsItems = [];

    for entry in entries
      fsItems.push(new FSItem(entry));

    @setItems(fsItems);
