export class Schemas {

  // Creates a new state for the current version.
  static newState() {
    const state: any = {}

    state.version = 4
    state.bookmarks = []
    state.servers = []
    state.visible = false
    state.height = 200
    state.left = {}
    state.left.tabs = []
    state.right = {}
    state.right.tabs = []

    return state
  }

  static upgrade(state: any) {
    if ((state.version === 1) || (state.version === 2)) {
      this.upgradeTo3(state)
    }

    if (state.version === 3) {
      this.upgradeTo4(state)
    }

    return state
  }

  static upgradeTo3(state: any) {
    state.version = 3
    return this.upgradeServersTo3(state.servers)
  }

  static upgradeServersTo3(servers: any[]) {
    if (!servers) {
      return
    }

    return Array.from(servers).map((server) =>
      this.upgradeServerTo3(server))
  }

  static upgradeServerTo3(server: any) {
    if (server.protocol !== 'sftp') {
      return
    }

    server.privateKeyPath = ''
    server.passphrase = ''
    server.loginWithPassword = true
    return server.usePassphrase = false
  }

  static upgradeTo4(state: any) {
    state.version = 4
    return this.upgradeServersTo4(state.servers)
  }

  static upgradeServersTo4(servers: any[]) {
    if (!servers) {
      return
    }

    return Array.from(servers).map((server) =>
      (server.name = ''))
  }

}