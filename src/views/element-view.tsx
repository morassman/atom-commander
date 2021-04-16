const etch = require('etch')

import { Props, View } from './view'

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

export class ElementView<P extends Props = Props, R extends object = {}, E extends HTMLElement = HTMLElement> extends View<P, R, E> {

  constructor(public readonly tag: Tag, props: P, private children?: any[]) {
    super(props, false, getTagDisplay(tag))
    this.initialize()
  }

  render() {
    let className = this.getClassName()
    let attributes = this.getAttributes()

    if (this.props.className) {
      className = this.props.className+' '+className
      className = className.trim()
    }

    if (this.props.attributes) {
      attributes = {
        ...this.props.attributes,
        ...attributes
      }
    }

    const props = {
      ...this.props,
      className,
      attributes
    }

    return etch.dom(this.tag || 'div', props, this.children || [])
  }

}

export class Div<P extends Props = Props, R extends object = {}> extends ElementView<P, R> {

  constructor(props: P, children: any[]) {
    super('div', props, children)
  }

}

export class Span<P extends Props = Props, R extends object = {}> extends ElementView <P, R> {

  constructor(props: P, children: any[]) {
    super('span', props, children)
  }

}

type InputProps = Props & {
  type: string
}

export class Input extends ElementView<InputProps, {}, HTMLInputElement> {

  constructor(props: InputProps) {
    super('input', props)
  }

}