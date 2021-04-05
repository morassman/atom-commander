/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Schemas;
module.exports =
(Schemas = class Schemas {

  // Creates a new state for the current version.
  static newState() {
    const state = {};
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
  }

  static upgrade(state) {
    if ((state.version === 1) || (state.version === 2)) {
      this.upgradeTo3(state);
    }

    if (state.version === 3) {
      this.upgradeTo4(state);
    }

    return state;
  }

  static upgradeTo3(state) {
    state.version = 3;
    return this.upgradeServersTo3(state.servers);
  }

  static upgradeServersTo3(servers) {
    if (!servers) {
      return;
    }

    return Array.from(servers).map((server) =>
      this.upgradeServerTo3(server));
  }

  static upgradeServerTo3(server) {
    if (server.protocol !== 'sftp') {
      return;
    }

    server.privateKeyPath = '';
    server.passphrase = '';
    server.loginWithPassword = true;
    return server.usePassphrase = false;
  }

  static upgradeTo4(state) {
    state.version = 4;
    return this.upgradeServersTo4(state.servers);
  }

  static upgradeServersTo4(servers) {
    if (!servers) {
      return;
    }

    return Array.from(servers).map((server) =>
      (server.name = ''));
  }
});
