ListFileView = require './list-file-view'
ListDirectoryView = require './list-directory-view'
ContainerView = require './container-view'
{$} = require 'atom-space-pen-views'

module.exports =
class ListView extends ContainerView

  constructor: ->
    super();

  @content: ->
    @div {class: 'list-view-resizer tool-panel', click:'focus'}, =>
      @div {class: 'list-view-scroller'}, =>
        @table {class: 'list-view-table focusable-panel'}, =>
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
