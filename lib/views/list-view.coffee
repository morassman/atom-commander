ListFileView = require './list-file-view'
ListDirectoryView = require './list-directory-view'
ContainerView = require './container-view'
{$} = require 'atom-space-pen-views'

module.exports =
class ListView extends ContainerView

  constructor: ->
    super();

  @container: ->
    @div {class: 'list-view-resizer tool-panel', click:'requestFocus', outlet: 'listViewResizer'}, =>
      @div {class: 'list-view-scroller', outlet:'scroller', click:'requestFocus'}, =>
        @table {class: 'list-view-table'}, =>
          @tbody {class: 'list-view list', tabindex: -1, outlet: 'tableBody'}

  clearItemViews: ->
    @tableBody.empty();
    @tableBody.append($(@createHeaderView()));

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

  addItemView: (itemView) ->
    @tableBody[0].appendChild(itemView);

  createHeaderView: ->
    return """
      <tr>
        <th>Name</th>
        <th>Extension</th>
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

  adjustHeight: (change) ->
    @listViewResizer.height(@listViewResizer.outerHeight() + change);
