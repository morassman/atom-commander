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

    bookmarkManager = @actions.main.getBookmarkManager();

    for bookmark in bookmarkManager.bookmarks
      item = {};
      item.bookmark = bookmark;

      if bookmark.name.length == 0
        item.text = bookmark.pathDescription.uri;
      else
        item.text = bookmark.name+": "+bookmark.pathDescription.uri;

      items.push(item);

    @setItems(items);

  getFilterKey: ->
    return "text";

  viewForItem: (item) ->
    if item.bookmark.name.length == 0
      return "<li>#{item.text}</li>";

    return """
    <li class='two-lines'>
    <div class='primary-line'>#{item.bookmark.name}</div>
    <div class='secondary-line'>#{item.bookmark.pathDescription.uri}</div>
    </li>"""

    # return "<li><span class='badge badge-info'>#{item.bookmark.name}</span> #{item.bookmark.path}</li>";

  confirmed: (item) ->
    if @open
      @cancel();
      @actions.goBookmark(item.bookmark);
    else
      @actions.main.getBookmarkManager().removeBookmark(item.bookmark);
      @refreshItems();

  cancelled: ->
    @hide();
    @panel?.destroy();

    if @fromView
      @actions.main.mainView.refocusLastView();
