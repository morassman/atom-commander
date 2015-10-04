Server = require './server'

module.exports =
class ServerManager

  constructor: (@main, state) ->
    @servers = [];
    @uploadCount = 0;
    @downloadCount = 0;

    if state?
      for config in state
        @addServer(config);

  getMain: ->
    return @main;

  getUploadCount: ->
    return @uploadCount;

  getDownloadCount: ->
    return @downloadCount;

  addServer: (config) ->
    server = new Server(@, config);
    @servers.push(server);
    return server;

  removeServer: (server) ->
    index = @servers.indexOf(server);

    if (index >= 0)
      @servers.splice(index, 1);

    fileSystem = server.getFileSystem();
    server.deleteLocalDirectory();
    server.dispose();
    @main.fileSystemRemoved(fileSystem);

  getServers: ->
    return @servers;

  getServerCount: ->
    return @servers.length;

  getServerWithLocalDirectoryName: (localDirectoryName) ->
    for server in @servers
      if server.getLocalDirectoryName() == localDirectoryName
        return server;

    return null;

  getFileSystemWithID: (fileSystemId) ->
    for server in @servers
      fileSystem = server.getFileSystem();

      if fileSystem.getID() == fileSystemId
        return fileSystem;

    return null;

  getWatcherWithLocalFilePath: (localFilePath) ->
    for server in @servers
      watcher = server.getWatcherWithLocalFilePath(localFilePath);

      if watcher != null
        return watcher;

    return null;

  uploadCountChanged: (old, current) ->
    @uploadCount += current - old;
    @main.refreshStatus();

  downloadCountChanged: (old, current) ->
    @downloadCount += current - old;
    @main.refreshStatus();

  serverClosed: (server) ->
    @main.serverClosed(server);

  dispose: ->
    for server in @servers
      server.dispose();

  serialize: ->
    state = [];

    for server in @servers
      state.push(server.serialize());

    return state;
