const etch = require('etch')

import { TextEditor } from 'atom'
import { Props, View } from '../view'
import { CompositeDisposable, Panel } from 'atom'

type Callback = (text: string | null) => void
type Validator = (text: string) => string | null

type InputModalProps = Props & {

  label: string

  callback: Callback

  validator?: Validator

  value?: string

  password?: boolean

  hideButtons?: boolean

}

type InputModalRefs = {

  editor: TextEditor

  warning: HTMLElement

  footer: HTMLElement

  okButton: HTMLButtonElement

}

export class InputModal extends View<InputModalProps, InputModalRefs> {
  
  disposables: CompositeDisposable | null
  
  panel: Panel | null

  previousActiveElement: any | null

  canceled: boolean

  editorElement: HTMLElement

  constructor(props: InputModalProps) {
    super(props)
  }

  render() {
    let editorClassName = 'input-text native-key-bindings'

    if (this.props.password) {
      editorClassName += ' atom-commander-password'
    }

    return <div className='atom-commander-input-modal'>
      <div className='atom-commander-input-modal-label'>{this.props.label}</div>
      <TextEditor ref='editor' mini={true}/>
      <div ref='warning' className='atom-commander-input-modal-warning'/>
      <div ref='footer' className="atom-commander-input-modal-footer">
        <div />
        <button className="btn" onClick={() => this.cancel(true)}>Cancel</button>
        <button ref='okButton' className="btn btn-primary" onClick={() => this.confirm()}>OK</button>
        <div />
      </div>
    </div>
  }

  initialize() {
    super.initialize()

    this.editorElement = (this.refs.editor as any).element as HTMLElement

    if (this.props.value) {
      this.refs.editor.setText(this.props.value)
    }

    if (this.props.hideButtons) {
      this.refs.footer.style.display = 'none'
    }

    this.refs.editor.onDidChange(() => this.validate())
    this.editorElement.addEventListener('blur', () => this.onBlur())
    
    if (this.props.password) {
      this.editorElement.classList.add('atom-commander-password')
    }

    this.disposables = atom.commands.add(this.editorElement, {
      'core:confirm': () => this.confirm(),
      'core:cancel': () => this.cancel(true)
    })
  }

  onBlur() {
    if (this.props.hideButtons) {
      this.cancel(false)
    }
  }

  validate(): { valid: boolean, value: string} {
    let valid = true
    const value = this.refs.editor.getText().trim()

    if (this.props.validator) {
      const warning = this.props.validator(value)

      if (warning) {
        valid = false
        this.refs.warning.textContent = warning
      }
    }

    this.refs.okButton.disabled = !valid
    
    return {
      valid,
      value
    }
  }

  show() {
    this.previousActiveElement = document.activeElement
    this.panel = atom.workspace.addModalPanel({ item: this, visible: true, autoFocus: true })
    this.editorElement.focus()
  }

  confirm() {
    const {valid, value} = this.validate()

    if (valid) {
      this.props.callback(value)
      this.close(true)
    }
  }

  cancel(restoreFocus: boolean) {
    if (this.canceled) {
      return
    }

    this.canceled = true
    this.props.callback(null)
    this.close(restoreFocus)
  }

  close(restoreFocus: boolean) {
    if (this.panel) {
      this.panel.destroy()
      this.panel = null
    } else {
      this.destroy()
    }

    if (restoreFocus) {
      this.restoreFocus()
    }
  }

  async destroy() {
    await super.destroy()

    if (this.disposables) {
      this.disposables.dispose()
      this.disposables = null
    }
  }

  restoreFocus() {
    if (this.previousActiveElement && this.previousActiveElement.parentElement) {
      this.previousActiveElement.focus()
    } else {
      atom.views.getView(atom.workspace).focus()
    }
  }

}
