Server = require './server'

module.exports =
class ServerManager

  constructor: (@main, state) ->
    @servers = [];

    if state?
      for config in state
        @addServer(config);

  addServer: (config) ->
    server = new Server(@main, config);
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

  serialize: ->
    state = [];

    for server in @servers
      state.push(server.serialize());

    return state;
