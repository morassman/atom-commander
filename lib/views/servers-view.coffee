CacheView = require './cache/cache-view'
EditServerDialog = require '../dialogs/edit-server-dialog'
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
    showCount = @showCount();

    for server in @serverManager.getServers()
      if !onlyOpen or server.isOpen()
        item = {};
        item.server = server;
        item.fileCount = 0;
        item.name = server.getName();
        item.description = server.getDescription();
        item.filter = item.name + " " + item.description;

        if showCount
          item.fileCount = item.server.getCacheFileCount();
          # item.text += " ("+@createCountString(item.fileCount)+")";

        items.push(item);

    @setItems(items);
    return items;

  createCountString: (count) ->
    if count == 1
      return "1 file in cache";

    return count+" files in cache";

  getFilterKey: ->
    return "filter";

  showCount: ->
    return @mode != "open";

  viewForItem: (item) ->
    primary = "";
    secondary = "";
    count = "";

    if item.name.length > 0
      primary = item.name;
      secondary = item.description;
    else
      primary = item.description;

    if @showCount()
      count = "(" + @createCountString(item.fileCount) + ")";

    return "<li class='two-lines'>" +
      "<div class='primary-line'>" +
        "<div style='display: flex'>" +
          "<div style='flex: 1'>" +
            "<span>#{primary}</span>" +
            "<span class='text-subtle' style='margin-left: 0.5em'>#{count}</span>" +
          "</div>" +
          "<div class='inline-block highlight-info' style='margin-left: 0.5em'" +
            "style='white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>" +
            "#{item.server.getUsername()}" +
          "</div>" +
        "</div>" +
      "</div>" +
      "<div class='secondary-line'>#{secondary}</div>" +
    "</li>";

  confirmed: (item) ->
    if @mode == "open"
      @confirmOpen(item);
    else if @mode == "close"
      @confirmClose(item);
    else if @mode == "remove"
      @confirmRemove(item);
    else if @mode == "cache"
      @confirmCache(item);
    else if @mode == "edit"
      @confirmEdit(item);

  confirmOpen: (item) ->
    @cancel();
    @actions.goDirectory(item.server.getInitialDirectory());

  confirmClose: (item) ->
    confirmed = () =>
      item.server.close();
      items = @refreshItems();
      if items.length == 0
        @cancel();

    if item.server.getTaskCount() > 0
      response = atom.confirm
        message: "Close"
        detailedMessage: "Files on this server are still being accessed. Are you sure you want to close the connection?"
        buttons: ["No", "Yes"]

      if response == 1
        confirmed()
    else
      confirmed()


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

    confirmed = () =>
      @serverManager.removeServer(item.server);
      if @serverManager.getServerCount() == 0
        @cancel();
      else
        @refreshItems();

    if question != null
      response = atom.confirm
        message: "Remove"
        detailedMessage: question+" Are you sure you want to remove the server?"
        buttons: ["No", "Yes"]

      if response == 1
        confirmed()
    else
      confirmed()

  confirmCache: (item) ->
    @cancel();

    view = new CacheView(item.server);
    pane = atom.workspace.getActivePane();
    item = pane.addItem(view, {index: 0});
    pane.activateItem(item);

  confirmEdit: (item) ->
    @cancel();

    if item.server.isOpen()
      atom.notifications.addWarning("The server must be closed before it can be edited.");
      return;

    if item.server.getOpenFileCount() > 0
      atom.notifications.addWarning("A server cannot be edited while its files are being accessed.");
      return;


    dialog = new EditServerDialog(item.server);
    dialog.attach();

  cancelled: ->
    @hide();
    @panel?.destroy();

    if @fromView
      @actions.main.mainView.refocusLastView();
