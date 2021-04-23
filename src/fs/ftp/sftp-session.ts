import { Client, ConnectConfig, SFTPWrapper } from 'ssh2'
import Utils from '../../utils'
import { SFTPConfig } from './sftp-config'
import { SFTPFileSystem } from './sftp-filesystem'

export class SFTPSession {
  
  config: SFTPConfig
  
  clientConfig: ConnectConfig

  sftp?: SFTPWrapper

  client?: Client

  open: boolean

  constructor(public readonly fileSystem: SFTPFileSystem) {
    this.config = this.fileSystem.config
    this.clientConfig = this.fileSystem.clientConfig
    this.open = false
  }

  getClient(): SFTPWrapper | undefined {
    return this.sftp
  }

  // Called if connecting failed due to invalid credentials. This will only try
  // to connect again if a password or passphrase should be prompted for.
  reconnect(err: any) {
    delete this.clientConfig.password
    delete this.clientConfig.passphrase

    if (this.config.loginWithPassword || this.config.usePassphrase) {
      this.connect()
    } else {
      this.fileSystem.emitError(err)
      this.canceled()
    }
  }

  connect() {
    let { password, passphrase } = this.clientConfig

    if (!password) {
      password = ''
    }

    if (!passphrase) {
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

    Utils.promptForPassword(prompt, (input: string) => {
      if (input) {
        this.connectWith(password || '', input)
      } else {
        const err = {
          canceled: true,
          message: 'Incorrect credentials for '+this.clientConfig.host
        }
        this.fileSystem.emitError(err)
        this.canceled()
      }
    })
  }

  private onClientReady(err: Error | undefined, sftp: SFTPWrapper, password: string, passphrase: string) {
    if (err) {
      this.fileSystem.emitError(err)
      this.close()
      return
    }

    this.sftp = sftp

    this.sftp.on('end', () => {
      this.close()
    })

    // If the connection was successful then remember the password for
    // the rest of the session.
    if (password.length > 0) {
      this.clientConfig.password = password
    }

    if (passphrase.length > 0) {
      this.clientConfig.passphrase = passphrase
    }

    this.opened()
  }

  private onClientError(err: any) {
    if (err.level === 'client-authentication') {
      atom.notifications.addWarning('Incorrect credentials for '+this.clientConfig.host)
      err = {}
      err.canceled = false
      err.message = 'Incorrect credentials for '+this.clientConfig.host
      this.reconnect(err)
    } else {
      this.fileSystem.emitError(err)
    }
  }

  private onClientKeyboardInteractive(prompt: any, finish: any, password: string) {
    if (password.length > 0) {
      finish([password])
    } else {
      const prompts = prompt.map((p: any) => p.prompt)
      const values: string[] = []
      this.prompt(0, prompts, values, finish)
    }
  }

  // All connectWith? functions boil down to this one.
  //
  // password: The password that should be used. empty if not logging in with password.
  // passphrase: The passphrase to use when logging in with a private key. empty if it shouldn't be used.
  connectWith(password: string, passphrase: string) {
    this.sftp = undefined
    this.client = new Client()

    this.client.on('ready', () => {
      this.client?.sftp((err, sftp) => this.onClientReady(err, sftp, password, passphrase))
    })

    this.client.on('error', (err: any) => this.onClientError(err))
    this.client.on('close', () => this.close())
    this.client.on('end', () => this.close())
    this.client.on('keyboard-interactive', (name: any, instructions: any, instructionsLang: any, prompt: any, finish: any) => this.onClientKeyboardInteractive(prompt, finish, password))

    const connectConfig: ConnectConfig = {
      ...this.clientConfig
    }

    connectConfig.password = password
    connectConfig.passphrase = passphrase

    if (connectConfig.password.length === 0) {
      delete connectConfig['password']
    }

    if (connectConfig.passphrase.length === 0) {
      delete connectConfig['passphrase']
    }

    this.client.connect(connectConfig)
  }

  disconnect() {
    if (this.sftp) {
      this.sftp.end()
      this.sftp = undefined
    }

    if (this.client) {
      this.client.end()
      this.client = undefined
    }

    this.close()
  }

  opened() {
    this.open = true
    this.fileSystem.sessionOpened(this)
  }

  canceled() {
    this.disconnect()
    this.fileSystem.sessionCanceled(this)
  }

  close() {
    if (this.open) {
      this.open = false
      this.fileSystem.sessionClosed(this)
    }
  }

  prompt(index: number, prompts: string[], values: string[], finish: any) {
    Utils.promptForPassword(prompts[index], (input: string) => {
      if (input != null) {
        values.push(input)

        if (prompts.length === (index + 1)) {
          finish(values)
        } else {
          this.prompt(index + 1, prompts, values, finish)
        }
      } else {
        const err = {
          canceled: true,
          message: 'Incorrect credentials for '+this.clientConfig.host
        }

        this.fileSystem.emitError(err)
        this.canceled()
      }
    })
  }
}
