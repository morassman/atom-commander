import { Panel } from 'atom'
import { View } from '../view'

const SelectList = require('atom-select-list')

interface RendererOptions {
  
  selected: boolean
  
  index: number
  
  visible: boolean
}

export type ItemProvider<I> = () => I[]

/**
 * Callback type receives the item that was selected. undefined if the modal was
 * canceled. If an item was selected and the modal should remain open, return true.
 */
export type Callback<I> = (item?: I) => boolean

export type TwoLineRenderer<I> = (item: I) => {
  primary: string | HTMLElement | View,
  secondary?: string | HTMLElement | View
}

export type ItemRenderer<I> = (item: I, options: RendererOptions) => HTMLElement

export function twoLineRenderer<I>(renderer: TwoLineRenderer<I>): ItemRenderer<I> {
  return (item: I, options: RendererOptions): HTMLElement => {
    const li = document.createElement('li')

    if (!options.visible) {
      return li
    }

    const r = renderer(item)
    const p = r.primary
    const s = r.secondary

    if (!s) {
      if (typeof p === 'string') {
        li.textContent = p
      } else if (p instanceof View) {
        li.appendChild(p.element)
      } else {
        li.appendChild(p)
      }

      return li
    }

    const primaryElement = document.createElement('div')
    primaryElement.classList.add('primary-line')

    if (typeof p === 'string') {
      primaryElement.textContent = p
    } else if (p instanceof View) {
      primaryElement.appendChild(p.element)
    } else {
      primaryElement.appendChild(p)
    }

    const secondaryElement = document.createElement('div')
    secondaryElement.classList.add('secondary-line')

    if (typeof s === 'string') {
      secondaryElement.textContent = s
    } else if (s instanceof View) {
      secondaryElement.appendChild(s.element)
    } else {
      secondaryElement.appendChild(s)
    }

    li.classList.add('event', 'two-lines')
    li.appendChild(primaryElement)
    li.appendChild(secondaryElement)

    return li
  }
}

export class ListModal<I> {
  
  selectList: typeof SelectList
  
  panel: Panel

  constructor(itemProvider: ItemProvider<I>, renderer: ItemRenderer<I>, filterKeyForItem: (item: I) => string, callback: Callback<I | undefined>) {
    this.selectList = new SelectList({
      items: itemProvider(),
      elementForItem: renderer,
      filterKeyForItem,
      didConfirmSelection: (item: I) => {
        const keepOpen = callback(item)

        if (keepOpen) {
          const items = itemProvider()

          if (items.length > 0) {
            this.selectList.update({
              items
            })
          } else {
            this.close()
          }
        } else {
          this.close()
        }
      },
      didConfirmEmptySelection: () => {
        this.close()
        callback()
      },
      didCancelSelection: () => {
        this.close()
        callback()
      }
    })
  }

  open() {
    this.panel = atom.workspace.addModalPanel({ item: this.selectList, visible: true, autoFocus: true })
    this.selectList.focus()
  }

  close() {
    if (this.panel) {
      this.panel.destroy()
    }
  }

}
