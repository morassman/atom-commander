CacheView = require './cache/cache-view'
{Directory} = require 'atom'
{SelectListView} = require 'atom-space-pen-views'

module.exports =
class ServersView extends SelectListView

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
    # Only show those that have an open connection.
    onlyOpen = @mode == "close";
    showCount = @mode != "open";

    for server in @serverManager.getServers()
      if !onlyOpen or server.isOpen()
        item = {};
        item.server = server;
        item.fileCount = 0;
        item.text = server.getDescription();

        if showCount
          item.fileCount = item.server.getCacheFileCount();
          item.text += " ("+@createCountString(item.fileCount)+")";

        items.push(item);

    @setItems(items);
    return items;

  createCountString: (count) ->
    if count == 1
      return "1 file in cache";

    return count+" files in cache";

  getFilterKey: ->
    return "text";

  viewForItem: (item) ->
    return "<li>#{item.text} <span class='highlight highlight-info' style='float: right'>#{item.server.getUsername()}</span></li>";

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

    question = null;
    taskCount = item.server.getTaskCount();

    if item.fileCount > 0
      question = "There are still files in the cache. Removing the server will clear the cache.";
    else if taskCount > 0
      question = "Files on this server are still being accessed. Removing the server will also clear the cache."

    if question != null
      option = atom.confirm
        message: "Remove"
        detailedMessage: question+" Are you sure you want to remove the server?"
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
