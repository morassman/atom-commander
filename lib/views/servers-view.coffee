CacheView = require './cache/cache-view'
{Directory} = require 'atom'
{SelectListView} = require 'atom-space-pen-views'

module.exports =
class BookmarksView extends SelectListView

  constructor: (@actions, @mode, @fromView) ->
    super();

  initialize: ->
    super();

    @serverManager = @actions.main.getServerManager();

    @addClass('overlay from-top');
    @refreshItems();

    @panel ?= atom.workspace.addModalPanel(item: this);
    @panel.show();
    @focusFilterEditor();

  refreshItems: ->
    items = [];
    onlyOpen = @mode == "close";

    for server in @serverManager.getServers()
      if !onlyOpen or server.isOpen()
        item = {};
        item.server = server;
        item.text = server.getDescription();
        items.push(item);

    @setItems(items);

  getFilterKey: ->
    return "text";

  viewForItem: (item) ->
    return "<li>#{item.text}</li>";

  confirmed: (item) ->
    if @mode == "open"
      @confirmOpen(item);
    else if @mode == "close"
      @confirmClose(item);
    else if @mode == "remove"
      @confirmRemove(item);
    else if @mode == "cache"
      @confirmCache(item);

  confirmOpen: (item) ->
    @cancel();
    @actions.goDirectory(item.server.getInitialDirectory());

  confirmClose: (item) ->
    item.server.close();
    @refreshItems();

  confirmRemove: (item) ->
    if item.server.getOpenFileCount() == 0
      @serverManager.removeServer(item.server);
      if @serverManager.getServerCount() == 0
        @cancel();
      else
        @refreshItems();
    else
      atom.notifications.addWarning("A server cannot be removed while its files are being edited.");

  confirmCache: (item) ->
    @cancel();

    view = new CacheView(item.server);
    pane = atom.workspace.getActivePane()
    item = pane.addItem(view, 0)
    pane.activateItem(item);

  cancelled: ->
    @hide();
    @panel?.destroy();

    if @fromView
      @actions.main.mainView.refocusLastView();
