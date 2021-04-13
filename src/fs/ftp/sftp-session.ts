const fs = require('fs')
const SSH2 = require('ssh2')

import Utils from '../../utils'
import { SFTPConfig } from './sftp-config'
import { SFTPFileSystem } from './sftp-filesystem'

export class SFTPSession {
  
  config: SFTPConfig
  
  clientConfig: any

  client: any

  ssh2: any

  open: any


  constructor(public readonly fileSystem: SFTPFileSystem) {
    this.config = this.fileSystem.config
    this.clientConfig = this.fileSystem.clientConfig

    this.client = null
    this.ssh2 = null
    this.open = null
  }

  getClient() {
    return this.client
  }

  // Called if connecting failed due to invalid credentials. This will only try
  // to connect again if a password or passphrase should be prompted for.
  reconnect(err: any) {
    delete this.clientConfig.password
    delete this.clientConfig.passphrase

    if (this.config.loginWithPassword || this.config.usePassphrase) {
      return this.connect()
    } else {
      this.fileSystem.emitError(err)
      return this.canceled()
    }
  }

  connect() {
    let {
      password
    } = this.clientConfig
    let {
      passphrase
    } = this.clientConfig

    if ((password == null)) {
      password = ''
    }

    if ((passphrase == null)) {
      passphrase = ''
    }

    if (this.config.loginWithPassword) {
      this.connectWith(password, passphrase)
      return
    }

    if (this.config.usePassphrase && (passphrase.length > 0)) {
      this.connectWith(password, passphrase)
      return
    }

    if (!this.config.usePassphrase) {
      this.connectWith(password, passphrase)
      return
    }

    // Only the passphrase needs to be prompted for. The password will
    // be prompted for by ssh2.

    let prompt = 'Enter passphrase for '
    prompt += this.clientConfig.username
    prompt += '@'
    prompt += this.clientConfig.host
    prompt += ':'

    return Utils.promptForPassword(prompt, (input: string) => {
      if (input != null) {
        return this.connectWith(password, input)
      } else {
        const err = {
          canceled: true,
          message: 'Incorrect credentials for '+this.clientConfig.host
        }
        this.fileSystem.emitError(err)
        return this.canceled()
      }
    })
  }

  // All connectWith? functions boil down to this one.
  //
  // password: The password that should be used. empty if not logging in with password.
  // passphrase: The passphrase to use when loggin in with a private key. empty if it shouldn't be used.
  connectWith(password: string, passphrase: string) {
    this.client = null
    this.ssh2 = new SSH2()

    this.ssh2.on('ready', () => {
      return this.ssh2.sftp((err: any, sftp: any) => {
        if (err != null) {
          this.fileSystem.emitError(err)
          this.close()
          return
        }

        this.client = sftp

        this.client.on('end', () => {
          return this.close()
        })

        // If the connection was successful then remember the password for
        // the rest of the session.
        if (password.length > 0) {
          this.clientConfig.password = password
        }

        if (passphrase.length > 0) {
          this.clientConfig.passphrase = passphrase
        }

        return this.opened()
      })
    })

    this.ssh2.on('error', (err: any) => {
      if (err.level === 'client-authentication') {
        atom.notifications.addWarning('Incorrect credentials for '+this.clientConfig.host)
        err = {}
        err.canceled = false
        err.message = 'Incorrect credentials for '+this.clientConfig.host
        return this.reconnect(err)
      } else {
        return this.fileSystem.emitError(err)
      }
    })

    this.ssh2.on('close', () => {
      return this.close()
    })

    this.ssh2.on('end', () => {
      return this.close()
    })

    this.ssh2.on('keyboard-interactive', (name: any, instructions: any, instructionsLang: any, prompt: any, finish: any) => {
      if (password.length > 0) {
        return finish([password])
      } else {
        const prompts = prompt.map((p: any) => p.prompt)
        const values: string[] = []
        return this.prompt(0, prompts, values, finish)
      }
    })

    const connectConfig: any = {}

    for (let key in this.clientConfig) {
      const val = this.clientConfig[key]
      connectConfig[key] = val
    }

    connectConfig.password = password
    connectConfig.passphrase = passphrase

    if (connectConfig.password.length === 0) {
      delete connectConfig['password']
    }

    if (connectConfig.passphrase.length === 0) {
      delete connectConfig['passphrase']
    }

    return this.ssh2.connect(connectConfig)
  }

  disconnect() {
    if (this.client != null) {
      this.client.end()
      this.client = null
    }

    if (this.ssh2 != null) {
      this.ssh2.end()
      this.ssh2 = null
    }

    return this.close()
  }

  opened() {
    this.open = true
    return this.fileSystem.sessionOpened(this)
  }

  canceled() {
    this.disconnect()
    return this.fileSystem.sessionCanceled(this)
  }

  close() {
    if (this.open) {
      this.open = false
      return this.fileSystem.sessionClosed(this)
    }
  }

  prompt(index: number, prompts: string[], values: string[], finish: any) {
    return Utils.promptForPassword(prompts[index], (input: string) => {
      if (input != null) {
        values.push(input)
        if (prompts.length === (index + 1)) {
          return finish(values)
        } else {
          return this.prompt(index + 1, prompts, values, finish)
        }
      } else {
        const err = {
          canceled: true,
          message: 'Incorrect credentials for '+this.clientConfig.host
        }
        this.fileSystem.emitError(err)
        return this.canceled()
      }
    })
  }
}
