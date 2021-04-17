export class Schemas {

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
    this.upgradeServersTo3(state.servers)
  }

  static upgradeServersTo3(servers: any[]) {
    if (!servers) {
      return
    }

    servers.forEach((server) => this.upgradeServerTo3(server))
  }

  static upgradeServerTo3(server: any) {
    if (server.protocol !== 'sftp') {
      return
    }

    server.privateKeyPath = ''
    server.passphrase = ''
    server.loginWithPassword = true
    server.usePassphrase = false
  }

  static upgradeTo4(state: any) {
    state.version = 4
    this.upgradeServersTo4(state.servers)
  }

  static upgradeServersTo4(servers: any[]) {
    if (!servers) {
      return
    }

    servers.forEach((server) => {
      server.name = ''
    })
  }

}