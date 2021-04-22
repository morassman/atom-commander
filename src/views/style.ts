export type Tag = 'button' | 'div' | 'span' | 'input' | 'table' | 'thead' | 'tbody' | 'tr' | 'td' | 'input'

export function getTagDisplay(type?: string): string {
  if (!type) {
    return 'block'
  }

  switch (type) {
    case 'button':
    case 'div': 
      return 'block'
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

export class Style {

  display?: string

  visible: boolean

  overrideDisplay: boolean

  element: HTMLElement

  constructor(private style: any={}, private onChange: ()=>void) {
    this.visible = true
    this.style = {}
    this.onChange = onChange

    if (style) {
      this.style = {
        ...this.style,
        ...style
      }
    }

    if (this.style.display) {
      this.display = this.style.display
      this.overrideDisplay = true
    } else {
      this.overrideDisplay = false
    }
  }

  setElement(element: HTMLElement) {
    this.element = element
  }

  /**
   * Called once the display value of the element has been determined. This
   * is simply used for 'remembering' what it is in case the element is made
   * invisible.
   * @param display 
   */
  backupDisplay() {
    if (!this.element || this.overrideDisplay) {
      return
    }

    this.display = window.getComputedStyle(this.element).getPropertyValue('display')

    if (!this.display) {
      this.display = getTagDisplay(this.element.tagName.toLowerCase())
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
    this.setVisible(true)
  }

  hide() {
    this.setVisible(false)
  }

  setVisible(visible: boolean) {
    if (this.visible !== visible) {
      this.visible = visible

      if (this.visible) {
        if (this.display) {
          this.style.display = this.display
        } else {
          delete this.style.display
        }
      } else {
        this.backupDisplay()
        this.style.display = 'none'
      }

      this.changed()
    }
  }

  isHidden() {
    return !this.visible
  }

  isVisible() {
    return this.visible
  }

  toString() {
    return Object.entries(this.style).map(e => `${e[0]}:${e[1]}`).join(';')
  }
}
