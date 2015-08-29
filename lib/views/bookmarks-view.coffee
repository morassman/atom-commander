{Directory} = require 'atom'
{SelectListView} = require 'atom-space-pen-views'

module.exports =
class BookmarksView extends SelectListView

  constructor: (@actions, @open, @fromView) ->
    super();

  initialize: ->
    super();

    @addClass('overlay from-top');
    @refreshItems();

    @panel ?= atom.workspace.addModalPanel(item: this);
    @panel.show();
    @focusFilterEditor();

  refreshItems: ->
    items = [];

    for bookmark in @actions.main.bookmarks
      item = {};
      item.bookmark = bookmark;

      if bookmark[0].length == 0
        item.text = bookmark[1];
      else
        item.text = bookmark[0]+": "+bookmark[1];

      items.push(item);

    @setItems(items);

  getFilterKey: ->
    return "text";

  viewForItem: (item) ->
    if item.bookmark[0].length == 0
      return "<li>#{item.text}</li>";

    return """
    <li class='two-lines'>
    <div class='primary-line'>#{item.bookmark[0]}</div>
    <div class='secondary-line'>#{item.bookmark[1]}</div>
    </li>"""

    return "<li><span class='badge badge-info'>#{item.bookmark[0]}</span> #{item.bookmark[1]}</li>";

  confirmed: (item) ->
    if @open
      @actions.goPath(item.bookmark[1], true);
      @cancel();
    else
      @actions.main.removeBookmark(item.bookmark);
      @refreshItems();

  cancelled: ->
    @hide();
    @panel?.destroy();

    if @fromView
      @actions.main.mainView.refocusLastView();
