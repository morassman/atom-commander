{Directory} = require 'atom'
{SelectListView} = require 'atom-space-pen-views'

module.exports =
class BookmarksView extends SelectListView

  constructor: (@actions, @open, @fromView) ->
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

    for server in @serverManager.getServers()
      item = {};
      item.server = server;
      item.text = server.getDescription();
      items.push(item);

    @setItems(items);

  getFilterKey: ->
    return "text";

  viewForItem: (item) ->
    return "<li>#{item.text}</li>";
    # if item.bookmark[0].length == 0
    #   return "<li>#{item.text}</li>";
    #
    # return """
    # <li class='two-lines'>
    # <div class='primary-line'>#{item.bookmark[0]}</div>
    # <div class='secondary-line'>#{item.bookmark[1]}</div>
    # </li>"""
    #
    # return "<li><span class='badge badge-info'>#{item.bookmark[0]}</span> #{item.bookmark[1]}</li>";

  confirmed: (item) ->
    if @open
      @actions.goDirectory(item.server.getRootDirectory());
      @cancel();
    else
      if item.server.getOpenFileCount() == 0
        @serverManager.removeServer(item.server);
        if @serverManager.getServerCount() == 0
          @cancel();
        else
          @refreshItems();
      else
        atom.notifications.addWarning("A server cannot be removed while its files are being edited.");

  cancelled: ->
    @hide();
    @panel?.destroy();

    if @fromView
      @actions.main.mainView.refocusLastView();
