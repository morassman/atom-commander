import { Style } from './style'

const etch = require('etch')

type Tag = 'div' | 'span' | 'input' | 'table' | 'thead' | 'tbody' | 'tr' | 'td' | 'input'

function getTagDisplay(type?: Tag): string {
  if (!type) {
    return 'block'
  }

  switch (type) {
    case 'div': return 'block'
    case 'span': return 'inline'
    case 'table': return 'table'
    case 'thead': return 'table-header-group'
    case 'tbody': return 'table-row-group'
    case 'tr': return 'table-row'
    case 'td': return 'table-cell' 
    case 'input': return 'inline-block'
    default: break
  }

  return 'block'
}

export type Props = {

  ref?: string

  className?: string

  attributes?: any

  style?: any

  onKeyDown?: (e: KeyboardEvent) => void
  
  onKeyPress?: (e: KeyboardEvent) => void

  onKeyUp?: (e: KeyboardEvent) => void

  onClick?: (e: MouseEvent) => void

  onDoubleClick?: (e: MouseEvent) => void

  onMouseDown?: (e: MouseEvent) => void

  onMouseUp?: (e: MouseEvent) => void

  onBlur?: (e: FocusEvent) => void

  onDrag?: (e: DragEvent) => void

  onDragEnd?: (e: DragEvent) => void

  onDragEnter?: (e: DragEvent) => void

  onDragLeave?: (e: DragEvent) => void

  onDragOver?: (e: DragEvent) => void

  onDragStart?: (e: DragEvent) => void

  onDrop?: (e: DragEvent) => void

  onFocus?: (e: FocusEvent) => void

  onInput?: (e: Event) => void

  onMouseEnter?: (e: MouseEvent) => void

  onMouseLeave?: (e: MouseEvent) => void

  onMouseMove?: (e: MouseEvent) => void

  onMouseOut?: (e: MouseEvent) => void

  onMouseOver?: (e: MouseEvent) => void

  onWheel?: (e: MouseEvent) => void

  onScroll?: (e: Event) => void

}

export abstract class View<P extends Props = Props, R extends object = {}, E extends HTMLElement = HTMLElement> {

  props: P

  refs: R

  style: Style

  classes: string[]

  attributes: any

  initialized: boolean
  
  destroyed: boolean

  element: E

  constructor(props: P, init=true) {
    this.props = props
    this.attributes = {}
    this.style = new Style(props.style, () => this.attributesChanged())
    this.classes = []
    this.initialized = false
    this.destroyed = false

    if (init) {
      this.initialize()
    }
  }

  initialize() {
    this.initialized = true
    etch.initialize(this)
  }

  abstract render(): any

  update(props?: any, children?: any) {
    if (this.initialized) {
      return etch.update(this)
    } else {
      return Promise.resolve()
    }
  }

  readAfterUpdate() {
    this.style.setElement(this.element)
  }

  getElement(): any {
    return this.element
  }

  addClass(c: string) {
    if (!this.classes.includes(c)) {
      this.classes.push(c)
      this.update()
    }
  }

  addClasses(cs: string[]) {
    if (cs) {
      cs.forEach(c => {
        if (!this.classes.includes(c)) {
          this.classes.push(c)
        }
      })

      this.update()
    }
  }

  append(child: HTMLElement | View) {
    if (child instanceof View) {
      child = child.element
    }

    if (child) {
      this.element.append(child)
    }
  }

  removeClass(c: string) {
    if (this.hasClass(c)) {
      this.classes = this.classes.filter(k => k !== c)
      this.update()
    }
  }

  hasClass(c: string): boolean {
    return this.classes.includes(c)
  }

  setTextContent(textContent: string) {
    if (this.element) {
      this.element.textContent = textContent
    }
  }

  getTextContent(): string | null{
    return this.element ? this.element.textContent : null
  }

  appendTextContent(textContent: string) {
    const current = this.getTextContent()
    this.setTextContent(current ? current + textContent : textContent)
  }

  getClassName(): string {
    let className = this.classes.join(' ')

    if (this.props.className) {
      className = `${className} ${this.props.className}`
    }

    return className.trim()
  }

  getAttributes(): any {
    let attributes: any = {
      ...this.attributes,
      class: this.getClassName(),
      style: this.style.toString()
    }

    if (this.props.attributes) {
      attributes = {
        ...attributes,
        ...this.props.attributes
      }
    }

    return attributes
  }

  getProps(): any {
    let props = {
      ...this.props,
      attributes: this.getAttributes()
    }

    delete props.className

    return props
  }

  mergeAttributes(attributes: any) {
    this.attributes = {
      ...this.attributes,
      ...attributes
    }
    this.attributesChanged()
  }

  setAttribute(key: string, value: any) {
    this.attributes[key] = value
    this.attributesChanged()
  }

  removeAttribute(key: string) {
    delete this.attributes[key]
    this.attributesChanged()
  }

  attributesChanged() {
    this.update()
  }

  show() {
    this.style.show()
  }

  hide() {
    this.style.hide()
  }

  isHidden(): boolean {
    return this.style.isHidden()
  }

  isVisible(): boolean {
    return this.style.isVisible()
  }

  hasFocus(): boolean {
    return document.activeElement === this.element
  }

  focus() {
    if (this.element) {
      this.element.focus()
    }
  }

  clear() {
    if (this.element) {
      while (this.element.lastChild) {
        this.element.removeChild(this.element.lastChild)
      }
    }
  }

  remove() {
    if (this.element) {
      this.element.remove()
    }
  }

  async destroy() {
    if (!this.destroyed) {
      this.remove()
      this.destroyed = true
      return await etch.destroy(this)
    }
  }

}