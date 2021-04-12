const etch = require('etch')

export type ViewProps = {

  ref?: string

}

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

  on?: any

  tabindex?: number
}

export abstract class View<P extends Props = Props, R extends object = {}> {

  props: P

  refs: R

  style: Style

  classes: string[]

  initialized: boolean
  
  destroyed: boolean

  element: HTMLElement

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

  render(): any {
    return <div></div>
  }

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
      this.element.appendChild(child)
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

  getClassName(): string {
    return this.classes.join(' ')
  }

  getAttributes(): any {
    return {
      style: this.style.toString()
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

  destroy() {
    if (!this.destroyed) {
      this.remove()
      this.destroyed = true
    }
  }

}