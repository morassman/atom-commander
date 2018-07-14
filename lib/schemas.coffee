module.exports =
class Schemas

  # Creates a new state for the current version.
  @newState: ->
    state = {};
    state.version = 4;
    state.bookmarks = [];
    state.servers = [];
    state.visible = false;
    state.height = 200;
    state.left = {};
    state.left.tabs = [];
    state.right = {};
    state.right.tabs = [];

    return state;

  @upgrade: (state) ->
    if state.version == 1 or state.version == 2
      @upgradeTo3(state);

    if state.version == 3
      @upgradeTo4(state);

    return state;

  @upgradeTo3: (state) ->
    state.version = 3;
    @upgradeServersTo3(state.servers);

  @upgradeServersTo3: (servers) ->
    if !servers
      return;

    for server in servers
      @upgradeServerTo3(server);

  @upgradeServerTo3: (server) ->
    if server.protocol != 'sftp'
      return;

    server.privateKeyPath = '';
    server.passphrase = '';
    server.loginWithPassword = true;
    server.usePassphrase = false;

  @upgradeTo4: (state) ->
    state.version = 4;
    @upgradeServersTo4(state.servers);

  @upgradeServersTo4: (servers) ->
    if !servers
      return;

    for server in servers
      server.name = '';
