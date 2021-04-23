import { Panel } from 'atom'

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

export type ItemRenderer<I> = (item: I, options: RendererOptions) => HTMLElement

export function twoLineRenderer<I>(primary: (item: I)=> string, secondary: (item: I)=>(string | undefined)): ItemRenderer<I> {
  return (item: I, options: RendererOptions): HTMLElement => {
    const li = document.createElement('li')

    if (!options.visible) {
      return li
    }

    const p = primary(item)
    const s = secondary(item)

    if (!s) {
      li.textContent = p
      return li
    }

    const primaryElement = document.createElement('div')
    primaryElement.classList.add('primary-line')
    primaryElement.textContent = p

    const secondaryElement = document.createElement('div')
    secondaryElement.classList.add('secondary-line')
    secondaryElement.textContent = s

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
          this.selectList.update({
            items: itemProvider()
          })
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
