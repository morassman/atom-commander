ListFileView = require './list-file-view'
ListDirectoryView = require './list-directory-view'
ListSymLinkView = require './list-symlink-view'
ContainerView = require './container-view'
{$} = require 'atom-space-pen-views'

module.exports =
class ListView extends ContainerView

  constructor: (left) ->
    super(left);

  @container: ->
    @div {class: 'atom-commander-list-view-resizer', click:'requestFocus', outlet: 'listViewResizer'}, =>
      @div {class: 'atom-commander-list-view-scroller', outlet:'scroller', click:'requestFocus'}, =>
        @table {class: 'atom-commander-list-view-table', outlet: 'table'}, =>
          @tbody {class: 'atom-commander-list-view list', tabindex: -1, outlet: 'tableBody'}

  initialize: (state)->
    super(state);

    @tableBody.focusout =>
      @refreshHighlight();

  clearItemViews: ->
    @tableBody.empty();
    @tableBody.append($(@createHeaderView()));

    @setExtensionColumnVisible(@isExtensionColumnVisible());
    @setSizeColumnVisible(@isSizeColumnVisible());
    @setDateColumnVisible(@isDateColumnVisible());

  createParentView: (index, directoryController) ->
    itemView = new ListDirectoryView();
    itemView.initialize(@, index, true, directoryController);
    return itemView;

  createFileView: (index, fileController) ->
    itemView = new ListFileView();
    itemView.initialize(@, index, fileController);
    return itemView;

  createDirectoryView: (index, directoryController) ->
    itemView = new ListDirectoryView();
    itemView.initialize(@, index, false, directoryController);
    return itemView;

  createSymLinkView: (index, symLinkController) ->
    itemView = new ListSymLinkView();
    itemView.initialize(@, index, symLinkController);
    return itemView;

  addItemView: (itemView) ->
    if !@isSizeColumnVisible()
      itemView.setSizeColumnVisible(false);

    if !@isDateColumnVisible()
      itemView.setDateColumnVisible(false);

    itemView.setExtensionColumnVisible(@isExtensionColumnVisible());

    @tableBody[0].appendChild(itemView);

  createHeaderView: ->
    return """
      <tr>
        <th id='name-header'>Name</th>
        <th id='extension-header'>Extension</th>
        <th id='size-header'>Size</th>
        <th id='date-header'>Date</th>
      </tr>
    """;

  focus: ->
    @tableBody.focus();
    super();

  hasFocus: ->
    return @tableBody.is(':focus') or document.activeElement is @tableBody[0]

  pageUp: ->
    @pageAdjust(true);

  pageDown: ->
    @pageAdjust(false);

  pageAdjust: (up) ->
    if (@highlightIndex == null) or (@itemViews.length == 0)
      return;

    itemViewHeight = @tableBody.height() / @itemViews.length;

    if (itemViewHeight == 0)
      return;

    scrollHeight = @scroller.scrollBottom() - @scroller.scrollTop();
    itemsPerPage = Math.round(scrollHeight / itemViewHeight);

    if up
      @highlightIndex(@highlightedIndex - itemsPerPage);
    else
      @highlightIndex(@highlightedIndex + itemsPerPage);

  adjustContentHeight: (change) ->
    @listViewResizer.height(@listViewResizer.outerHeight() + change);

  getContentHeight: ->
    return @listViewResizer.height();

  setContentHeight: (contentHeight) ->
    @listViewResizer.height(contentHeight);

  getScrollTop: ->
    return @scroller.scrollTop();

  setScrollTop: (scrollTop) ->
    @scroller.scrollTop(scrollTop);

  setExtensionColumnVisible: (visible) ->
    if visible
      @table.find('tr :nth-child(2)').show();
    else
      @table.find('tr :nth-child(2)').hide();

    @refreshItemViews();

  setSizeColumnVisible: (visible) ->
    if visible
      @table.find('tr :nth-child(3)').show();
    else
      @table.find('tr :nth-child(3)').hide();

  setDateColumnVisible: (visible) ->
    if visible
      @table.find('tr :nth-child(4)').show();
    else
      @table.find('tr :nth-child(4)').hide();
