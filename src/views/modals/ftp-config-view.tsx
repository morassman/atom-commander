const etch = require('etch')

import { Div } from '../element-view'
import { InputView } from '../input-view'
import { Props } from '../view'
import { ServerConfigView, ServerModal, ValidateResult } from './server-config-view'
import Client from 'ftp'
import { FTPConfig } from '../../fs/ftp/ftp-config'
import { ErrorCallback } from '../../fs'

type FTPConfigProps = Props & {

  parent: ServerModal

}

type FTPConfigViewRefs = {

  nameEditor: InputView

  hostEditor: InputView

  portEditor: InputView

  folderEditor: InputView

  usernameEditor: InputView

  passwordEditor: InputView

  anonymousCheckbox: HTMLInputElement

  storeCheckBox: HTMLInputElement

  url: HTMLElement

  testButton: HTMLButtonElement

  cancelButton: HTMLButtonElement

  okButton: HTMLButtonElement

  message: Div

}

export class FTPConfigView extends ServerConfigView<FTPConfigProps, FTPConfigViewRefs> {
  
  username: string

  messageType: number

  client?: Client
  
  constructor(props: FTPConfigProps) {
    super(props)
    this.username = ''
  }

  renderFieldRow(ref: string, label: string, tabindex: number, value='', password=false) {
    return <tr>
      <td className='text-highlight' attributes={{style: 'width: 40%'}}>{label}</td>
      <td><InputView ref={ref} tabindex={tabindex} password={password} value={value}/></td>
    </tr>
  }

  render() {
    return <div {...this.getProps()} className='atom-commander-ftp-dialog'>
      <table>
        <tbody>
          {this.renderFieldRow('nameEditor', 'Name', 1)}
          <tr>
            <td className='text-highlight' attributes={{style:'width: 40% padding-bottom: 0.5em'}}>URL</td>
            <td ref='url' attributes={{style:'padding-bottom: 0.5em'}}>{'ftp://'}</td>
          </tr>
          {this.renderFieldRow('hostEditor', 'Host', 2)}
          {this.renderFieldRow('portEditor', 'Port', 3, '21')}
          {this.renderFieldRow('folderEditor', 'Folder', 4)}
          <tr>
            <td>
              <label className='input-label'>
                <input ref='anonymousCheckbox' className='input-checkbox' type='checkbox' attributes={{tabindex: 5}} onInput={() => this.anonymousChanged()}/>
                Anonymous
              </label>
            </td>
          </tr>
          {this.renderFieldRow('usernameEditor', 'Username', 6)}
          {this.renderFieldRow('passwordEditor', 'Password', 7, '', true)}
          <tr>
            <td></td>
            <td className='encrypted'>Leave empty to prompt for password</td>
          </tr>
          <tr>
            <td>
            <label className='input-label'>
                <input ref='storeCheckBox' className='input-checkbox' type='checkbox' attributes={{tabindex: 8}}/>
                Store password
              </label>
            </td>
          </tr>
          <tr>
            <td></td>
            <td className='encrypted'>Passwords are encrypted</td>
          </tr>
        </tbody>
      </table>
    </div>
  }

  initialize() {
    super.initialize()

    // this.refs.spinner.hide()
    this.refs.storeCheckBox.checked = true
    
    this.refs.hostEditor.onChange(() => {
      this.refreshURL()
      this.props.parent.onConfigChange(this)
    })

    this.refs.portEditor.onChange(() => {
      this.refreshURL()
      this.props.parent.onConfigChange(this)
    })

    this.refs.folderEditor.onChange(() => {
      this.refreshURL()
    })

    this.refs.usernameEditor.onChange(() => {
      if (!this.isAnonymousSelected()) {
        this.username = this.refs.usernameEditor.getValue().trim()
      }

      this.props.parent.onConfigChange(this)
    })

    this.refs.passwordEditor.onChange(() => {
      this.props.parent.onConfigChange(this)
    })

  }

  anonymousChanged() {
    const selected = this.isAnonymousSelected()

    if (selected) {
      this.refs.usernameEditor.setValue('anonymous')
    } else {
      this.refs.usernameEditor.setValue(this.username)
    }

    this.props.parent.onConfigChange(this)
  }

  isAnonymousSelected(): boolean {
    return this.refs.anonymousCheckbox.checked
  }

  isStoreCheckBoxSelected(): boolean {
    return this.refs.storeCheckBox.checked
  }

  getPort(): string | undefined {
    let port = this.refs.portEditor.getValue().trim()

    if (port.length === 0) {
      return '21'
    }

    let iPort = parseInt(port)
    return Number.isInteger(iPort) ? port : undefined
  }

  getFolder(): string {
    let folder = this.refs.folderEditor.getValue().trim()

    if (folder.length > 0) {
      if (folder[0] !== '/') {
        folder = '/'+folder
      }
    } else {
      folder = '/'
    }

    return folder
  }

  refreshURL() {
    const server = this.refs.hostEditor.getValue().trim()
    let port: string | undefined = this.refs.portEditor.getValue().trim()

    let url = 'ftp://' + server

    if (server.length > 0) {
      port = this.getPort()

      if ((port !== null) && (port !== '21')) {
        url += ':' + port
      }
    }

    url += this.getFolder()
    this.refs.url.textContent = url
  }

  validate(): ValidateResult {
    let message = this.getErrorMessage()

    if (message) {
      return {
        message,
        level: 'error'
      }
    }

    message = this.getWarningMessage()

    if (message) {
      return {
        message,
        level: 'warning'
      }
    }

    return {
      message: '',
      level: 'ok'
    }
  }

  getErrorMessage(): string | undefined {
    const server = this.getServer()

    if (server.length === 0) {
      return 'Host must be specified.'
    }

    const port = this.getPort()

    if (port === undefined) {
      return 'Invalid port number.'
    }

    if (this.serverExists(server, port, this.getUsername())) {
      return 'This server has already been added.'
    }

    return undefined
  }

  getWarningMessage(): string | undefined {
    if (!this.isAnonymousSelected()) {
      if (this.refs.passwordEditor.getValue().trim().length === 0) {
        return 'Password not specified.'
      }
    }

    return undefined
  }

  serverExists(server: string, port: string, username: string): boolean {
    const id = `ftp_${server}_${port}_${username}`
    return this.props.parent.serverExists(id)
  }

  getName(): string {
    return this.refs.nameEditor.getValue().trim()
  }

  getServer(): string {
    return this.refs.hostEditor.getValue().trim()
  }

  getUsername(): string {
    return this.refs.usernameEditor.getValue().trim()
  }

  getPassword(): string {
    return this.refs.passwordEditor.getValue().trim()
  }

  selected() {
    this.refs.nameEditor.focus()
  }

  hasError(): boolean {
    return this.messageType === 2
  }

  private getConfigImpl(test: boolean): FTPConfig {
    const port = this.getPort()
    const anonymous = this.isAnonymousSelected()

    const config: FTPConfig = {
      protocol: 'ftp',
      name: this.getName(),
      host: this.getServer(),
      port: port === undefined ? 21 : Number.parseInt(port),
      folder: this.getFolder(),
      passwordDecrypted: true,
      user: this.getUsername(),
      password: anonymous ? 'anonymous@' : this.getPassword(),
      storePassword: anonymous ? true : this.isStoreCheckBoxSelected(),
      anonymous,
    }

    if (test) {
      if (!config.storePassword && config.password && (config.password.length === 0)) {
        delete config.password
      }
    }

    return config
  }

  getConfig(): FTPConfig {
    return this.getConfigImpl(false)
  }

  test(callback: ErrorCallback) {
    if (this.client) {
      return
    }

    this.client = new Client()

    this.client.on('ready', () => {
      if (this.client) {
        this.client.end()
        this.client = undefined
      }

      callback()
    })

    this.client.on('error', err => {
      if (this.client) {
        this.client.end()
        this.client = undefined
      }

      callback(err)
    })

    this.client.connect(this.getConfigImpl(true))
  }

  cancelTest() {
    if (this.client) {
      this.client.destroy()
    }
  }

}