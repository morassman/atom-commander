Server = require './server'

module.exports =
class ServerManager

  constructor: (state) ->
    @servers = [];

    if state?
      for config in state
        @addServer(config);

  addServer: (config) ->
    server = new Server(config);
    @servers.push(server);
    return server;

  removeServer: (server) ->
    index = @servers.indexOf(server);

    if (index >= 0)
      @servers.splice(index, 1);

  getServers: ->
    return @servers;

  serialize: ->
    state = [];

    for server in @servers
      state.push(server.serialize());

    return state;
