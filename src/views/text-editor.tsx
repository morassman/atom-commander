import { TextEditor } from 'atom'

const etch = require('etch')

export type InputViewProps = {

  ref: string

  password?: boolean
  
  tabindex?: number

  value?: string

  onChange?: (value: string) => void
}

export class InputView {

  refs: any

  editor: TextEditor

  element: HTMLElement

  props: InputViewProps

  constructor(props: InputViewProps) {
    this.props = props
    etch.initialize(this)
    this.element = this.refs.editor.element
    this.editor = this.refs.editor

    if (props.password) {
      this.element.classList.add('atom-commander-password')
    }

    if (Number.isInteger(props.tabindex)) {
      this.element.setAttribute('tabindex', `${this.props.tabindex}`)
    }

    if (props.value) {
      this.editor.setText(props.value)
    }

    if (this.props.onChange) {
      this.editor.onDidChange(() => {
        if (this.props.onChange) {
          this.props.onChange(this.editor.getText())
        }
      })
    }
  }

  render() {
    return <TextEditor ref='editor' mini={true}/>
  }

  update(props?: any, children?: any) {
    return etch.update(this)
  }

  focus() {
    this.element.focus()
  }

  setValue(value: string) {
    this.editor.setText(value)
  }

  getValue(): string {
    return this.editor.getText()
  }

  onChange(callback: (value: string) => void) {
    this.editor.onDidChange(() => callback(this.editor.getText()))
  }

}