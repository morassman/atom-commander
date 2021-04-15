const etch = require('etch')

import { Props, View } from './view'

type Tag = 'div' | 'span'

function getTagDisplay(type?: Tag): string {
  return 'block'
}

type ElementViewProps = Props & {
  tag?: Tag
}

export class ElementView extends View<ElementViewProps> {

  constructor(props: ElementViewProps, private children: any[]) {
    super(props, false, getTagDisplay(props.tag))
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

    return etch.dom(this.props.tag || 'div', props, this.children)
  }

}

export class Div extends ElementView {

  constructor(props: Props, children: any[]) {
    super({tag: 'div', ...props}, children)
  }

}

export class Span extends ElementView {

  constructor(props: Props, children: any[]) {
    super({tag: 'span', ...props}, children)
  }

}
