const etch = require('etch')

import { Props, View } from './view'

type ElementType = 'div' | 'span'

function getElementDisplay(type: ElementType): string {
  return 'block'
}

type ElementViewProps = Props & {
  type: ElementType
}

export class ElementView extends View<ElementViewProps> {

  constructor(props: ElementViewProps) {
    super(props, true, getElementDisplay(props.type))
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

    return etch.dom(this.props.type, props)
  }

}