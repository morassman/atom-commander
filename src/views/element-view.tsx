const etch = require('etch')

import { Tag } from './style'
import { Props, View } from './view'

export class ElementView<P extends Props = Props, R extends object = {}, E extends HTMLElement = HTMLElement> extends View<P, R, E> {

  constructor(public readonly tag: Tag, props: P, private children?: any[]) {
    super(props, false)
    this.initialize()
  }

  render() {
    return etch.dom(this.tag || 'div', this.getProps(), this.children || [])
  }

}

export class Button<P extends Props = Props, R extends object = {}> extends ElementView <P, R> {

  constructor(props: P, children?: any[]) {
    super('button', props, children)
  }

}

export class Div<P extends Props = Props, R extends object = {}> extends ElementView<P, R> {

  constructor(props: P, children?: any[]) {
    super('div', props, children)
  }

}

export class Span<P extends Props = Props, R extends object = {}> extends ElementView <P, R> {

  constructor(props: P, children?: any[]) {
    super('span', props, children)
  }

}

export class TBody<P extends Props = Props, R extends object = {}> extends ElementView <P, R> {

  constructor(props: P, children?: any[]) {
    super('tbody', props, children)
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