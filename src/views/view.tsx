const etch = require('etch')

export class Style {

  constructor(private display: string|undefined=undefined, private style: any={}, private onChange: ()=>void) {
    this.display = display
    this.style = {}
    this.onChange = onChange

    if (display) {
      this.style.display = display
    }

    if (style) {
      this.style = {
        ...this.style,
        ...style
      }
    }
  }

  changed() {
    if (this.onChange) {
      this.onChange()
    }
  }

  merge(style: any) {
    this.style = {
      ...this.style,
      ...style
    }
    this.changed()
  }

  set(key: string, value: any) {
    this.style[key] = value
    this.changed()
  }

  remove(key: string) {
    delete this.style[key]
    this.changed()
  }

  show() {
    if (this.display) {
      this.style.display = this.display
    } else {
      delete this.style.display
    }

    this.changed()
  }

  hide() {
    this.style.display = 'none'
    this.changed()
  }

  isHidden() {
    return this.style.display === 'none'
  }

  isVisible() {
    return this.style.display !== 'none'
  }

  toString() {
    return Object.entries(this.style).map(e => `${e[0]}:${e[1]}`).join(';')
  }
}

export type Props = {

  ref?: string

  className?: string

  attributes?: any

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

  initialized: boolean
  
  destroyed: boolean

  element: E

  constructor(props: P, init=true, display='block') {
    this.props = props
    this.style = new Style(display, {}, () => this.attributesChanged())
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

  append(child: any) {
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
    return this.classes.join(' ')
  }

  getAttributes(): any {
    return {
      style: this.style.toString()
    }
  }

  getRenderProps(): any {
    return {
      className: this.getClassName(),
      attributes: this.getAttributes()
    }
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