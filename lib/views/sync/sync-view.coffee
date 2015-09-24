PathUtil = require 'path'
SyncItemView = require './sync-item-view'
{View} = require 'atom-space-pen-views'

module.exports =
class SyncView extends View

  constructor: (@server) ->
    super(@server);

  @content: ->
    @div {class: "atom-commander-sync"}, =>
      @table =>
        @tbody {outlet: "tableBody", tabindex: -1}

  getTitle: ->
    return "Sync: "+@server.getDescription();

  getFileSystem: ->
    return @server.getFileSystem();

  initialize: ->
    cachePath = @server.getCachePath();
    filePaths = @server.getCachedFilePaths();

    header = new SyncItemView();
    header.initializeHeader(@);
    @tableBody[0].appendChild(header);

    for filePath in filePaths
      item = new SyncItemView();
      item.initializeRow(@, filePath, filePath.substring(cachePath.length));
      @tableBody[0].appendChild(item);

    fileSystem = @server.getFileSystem();

    if !fileSystem.isConnected()
      fileSystem.connect();
