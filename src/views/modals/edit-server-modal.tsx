const etch = require('etch')

import { main } from '../../main'
import { Panel } from 'atom'
import { ContainerView } from '../container-view'
import { Div, Span } from '../element-view'
import { FTPConfigView } from './ftp-config-view'
import { ServerConfigView, ServerModal, ValidateResult } from './server-config-view'
import { SFTPConfigView } from './sftp-config-view'
import { Server } from '../../servers/server'
import { RemoteConfig } from '../../fs/ftp/remote-config'
import { FTPConfig } from '../../fs/ftp/ftp-config'
import { SFTPConfig } from '../../fs/ftp/sftp-config'

export function showNewServerModal(view?: ContainerView) {
  const modal = new EditServerModal(view)
  modal.open()
}

type EditServerModalRefs = {

  heading: HTMLElement

  tabs: Div

  ftpButton: HTMLButtonElement

  sftpButton: HTMLButtonElement

  ftpDialog: FTPConfigView

  sftpDialog: SFTPConfigView

  validationResult: Div

  testButton: HTMLButtonElement

  testResult: Div

  spinner: Span

  cancelButton: HTMLButtonElement
  
  okButton: HTMLButtonElement

}

export class EditServerModal extends ServerModal<EditServerModalRefs> {

  panel?: Panel

  currentDialog: ServerConfigView<RemoteConfig>

  testing: boolean

  validateResult: ValidateResult

  constructor(private readonly view?: ContainerView, server?: Server) {
    super(server)
    this.testing = false
    this.initialize()
  }

  render() {
    return <div className='atom-commander-edit-server-modal'>
      <div ref='heading' className='atom-commander-edit-server-modal-heading'>Add Server</div>
      <Div ref='tabs' className='atom-commander-edit-server-modal-tabs block'>
        <div className='btn-group'>
          <button ref='ftpButton' className='btn selected' onClick={() => this.onFTPClick()}>FTP</button>
          <button ref='sftpButton' className='btn' onClick={() => this.onSFTPClick()}>SFTP</button>
        </div>
      </Div>

      <FTPConfigView ref='ftpDialog' style={{flex: 1}} parent={this}/>
      <SFTPConfigView ref='sftpDialog'  style={{flex: 1}} parent={this}/>

      <Div ref='validationResult' className='atom-commander-edit-server-modal-validation-result'/>

      <div className='atom-commander-edit-server-modal-buttons'>
        <button ref='testButton' className='btn' onClick={() => this.test()}>
          <Div style={{display: 'flex', 'align-items': 'center'}}>
            <Span ref='spinner' className='loading loading-spinner-tiny'/>
            <span>&nbsp;Test</span>
          </Div>
        </button>
        &nbsp;&nbsp;
        <Div ref='testResult' className='atom-commander-edit-server-modal-test-result'/>
        &nbsp;&nbsp;
        <button ref='cancelButton' className='btn' onClick={() => this.close()}>Cancel</button>
        &nbsp;&nbsp;
        <button ref='okButton' className='btn btn-primary' onClick={() => this.confirm()}>OK</button>
      </div>
    </div>
  }

  initialize() {
    super.initialize()
    this.refs.spinner.hide()

    if (this.server) {
      this.refs.heading.textContent = 'Edit Server'
      this.refs.tabs.hide()

      if (this.server.isFTP()) {
        this.currentDialog = this.refs.ftpDialog
        this.refs.ftpDialog.setConfig(this.server.getConfig() as FTPConfig)
        this.refs.sftpDialog.hide()
      } else {
        this.currentDialog = this.refs.sftpDialog
        this.refs.sftpDialog.setConfig(this.server.getConfig() as SFTPConfig)
        this.refs.ftpDialog.hide()
      }
    } else {
      this.currentDialog = this.refs.ftpDialog
      this.refs.sftpDialog.hide()
    }

    this.currentDialog.selected()
  }

  onFTPClick() {
    this.setSelected(this.refs.ftpButton, this.refs.ftpDialog)
  }

  onSFTPClick() {
    this.setSelected(this.refs.sftpButton, this.refs.sftpDialog)
  }

  setSelected(button: HTMLButtonElement, dialog: ServerConfigView) {
    this.refs.ftpButton.classList.remove('selected')
    this.refs.sftpButton.classList.remove('selected')
    this.currentDialog.hide()

    button.classList.add('selected')

    this.currentDialog = dialog
    this.currentDialog.show()
    setTimeout(() => this.currentDialog.selected(), 1)
  }

  showMessage(target: Div, message: string, level: 'ok' | 'warning' | 'error') {
    target.removeClasses(['text-error', 'text-warning', 'text-success'])

    if (level === 'ok') {
      target.addClass('text-success')
    } else if (level === 'warning') {
      target.addClass('text-warning')
    } else {
      target.addClass('text-error')
    }

    target.setTextContent(message)
  }

  validate() {
    this.validateResult = this.currentDialog.validate()
    this.showMessage(this.refs.validationResult, this.validateResult.message, this.validateResult.level)

    if (this.validateResult.level === 'error') {
      this.refs.okButton.setAttribute('disabled', '')
    } else {
      this.refs.okButton.removeAttribute('disabled')
    }
  }

  hasErrors(): boolean {
    if (!this.validateResult) {
      this.validate()
    }

    return this.validateResult.level === 'error'
  }

  onConfigChange(): void {
    this.validate()
  }

  onTestComplete(err?: any) {
    if (err) {
      this.showMessage(this.refs.testResult, `Connection failed : ${err}`, 'error')
    } else {
      this.showMessage(this.refs.testResult, 'Connection successful', 'ok')
    }

    this.testing = false
    this.refs.spinner.hide()
    this.refs.okButton.removeAttribute('disabled')
    this.refs.testButton.removeAttribute('disabled')
    this.refs.ftpButton.removeAttribute('disabled')
    this.refs.sftpButton.removeAttribute('disabled')
  }
  
  test() {
    this.validate()

    if (this.hasErrors()) {
      return
    }

    this.testing = true
    this.refs.spinner.show()
    this.refs.okButton.setAttribute('disabled', '')
    this.refs.testButton.setAttribute('disabled', '')
    this.refs.ftpButton.setAttribute('disabled', '')
    this.refs.sftpButton.setAttribute('disabled', '')

    this.currentDialog.test((err) => this.onTestComplete(err))
  }

  open() {
    this.panel = atom.workspace.addModalPanel({ item: this, visible: true, autoFocus: false })
    this.currentDialog.selected()
  }

  close() {
    if (this.testing) {
      this.currentDialog.cancelTest()
    }

    if (this.panel) {
      this.panel.destroy()
      this.panel = undefined
    } else {
      this.destroy()
    }
  }

  confirm() {
    if (this.hasErrors()) {
      return
    }

    this.close()

    const config = this.currentDialog.getConfig()
    const server = main.getServerManager().addServer(config)
    const directory = server.getInitialDirectory()

    if (directory && this.view) {
      this.view.openDirectory(directory)
    }
  }

}