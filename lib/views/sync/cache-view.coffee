CacheItemView = require './cache-item-view'
{$, View} = require 'atom-space-pen-views'

module.exports =
class CacheView extends View

  constructor: (@server) ->
    super(@server);

  @content: ->
    @div {class: "atom-commander-sync"}, =>
      @div {class: "title-panel"}, =>
        @span {class: "title", outlet: "titlePanel"}
        @button "Refresh", {class: "button btn btn-sm", outlet: "refreshButton", click: "refresh"}
      @div {class: "table-panel"}, =>
        @table =>
          @tbody {outlet: "tableBody", tabindex: -1}
      @div {class: "empty-panel", outlet: "emptyPanel"}, =>
        @ul {class: "background-message centered"}, =>
          @li "The cache is empty"

  getTitle: ->
    return "Sync: "+@server.getDescription();

  getLocalFileSystem: ->
    return @server.getMain().getLocalFileSystem();

  getTaskManager: ->
    return @server.getFileSystem().getTaskManager();

  initialize: ->
    @syncItems = [];
    @titlePanel.text("Local cache for "+@server.getDescription());

    @refreshButton.on 'mousedown', (e) -> e.preventDefault();

    @header = new CacheItemView();
    @header.initializeHeader(@);
    @jHeader = $(@header);
    @jHeader.addClass("table-header");
    @tableBody[0].appendChild(@header);

    fileSystem = @server.getFileSystem();

    if !fileSystem.isConnected()
      fileSystem.connect();

    @refresh();

  refresh: ->
    for syncItem in @syncItems
      syncItem.remove();

    @header.setChecked(false);

    @syncItems = [];
    cachePath = @server.getCachePath();
    filePaths = @server.getCachedFilePaths();

    for filePath in filePaths
      item = new CacheItemView();
      item.initializeRow(@, filePath, filePath.substring(cachePath.length));
      @syncItems.push(item);
      @tableBody[0].appendChild(item);

    @refreshEmptyPanel();

  setAllChecked: (checked) ->
    for syncItem in @syncItems
      syncItem.setChecked(checked);

  countChecked: ->
    result = 0;

    for syncItem in @syncItems
      if syncItem.isChecked()
        result++;

    return result;

  uploadChecked: ->
    for syncItem in @syncItems
      if syncItem.isChecked()
        syncItem.upload();

  downloadChecked: ->
    for syncItem in @syncItems
      if syncItem.isChecked()
        syncItem.download();

  deleteChecked: ->
    if @countChecked() == 0
      return;

    option = atom.confirm
      message: 'Delete'
      detailedMessage: 'Delete the selected files from the cache?'
      buttons: ["No", "Yes"]

    if option == 0
      return;

    for syncItem in @syncItems.slice()
      if syncItem.isChecked()
        syncItem.delete();

  removeItem: (item) ->
    item.remove();
    index = @syncItems.indexOf(item);

    if (index >= 0)
      @syncItems.splice(index, 1);

    @refreshEmptyPanel();

  refreshEmptyPanel: ->
    if @syncItems.length == 0
      @emptyPanel.show();
      @jHeader.hide();
    else
      @emptyPanel.hide();
      @jHeader.show();
