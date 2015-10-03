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
    return items;

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
    if item.server.getTaskCount() > 0
      option = atom.confirm
        message: "Close"
        detailedMessage: "Files on this server are still being accessed. Are you sure you want to close the connection?"
        buttons: ["No", "Yes"]

      if option == 0
        return;

    item.server.close();
    items = @refreshItems();
    if items.length == 0
      @cancel();

  confirmRemove: (item) ->
    if item.server.getOpenFileCount() > 0
      atom.notifications.addWarning("A server cannot be removed while its files are being edited.");
      return;

    if item.server.getTaskCount() > 0
      option = atom.confirm
        message: "Close"
        detailedMessage: "Files on this server are still being accessed. Are you sure you want to close the connection?"
        buttons: ["No", "Yes"]

      if option == 0
        return;

    @serverManager.removeServer(item.server);
    if @serverManager.getServerCount() == 0
      @cancel();
    else
      @refreshItems();

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
