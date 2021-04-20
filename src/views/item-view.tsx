const etch = require('etch')

import { VItem } from '../fs'
import { ContainerView } from './container-view'
import { Props, View } from './view'

type ItemViewRefs = {
  
  name: HTMLElement
  
  extension: HTMLElement
  
  size: HTMLElement
  
  date: HTMLElement

}

export abstract class ItemView<I extends VItem = VItem> extends View<Props, ItemViewRefs> {

  selected: boolean

  highlighted: boolean

  focused: boolean

  constructor(public readonly containerView: ContainerView, public index: number, public readonly item: I) {
    super({}, false)
    this.selected = false
    this.highlighted = false
    this.focused = false
    this.addClass('item')
    item.setView(this)

    this.initialize()
  }

  render() {
    return <tr {...this.getProps()}>
      <td ref='name'/>
      <td ref='extension' className='align-right'/>
      <td ref='size' className='align-right'/>
      <td ref='date' className='align-right'/>
    </tr>
  }

  initialize() {
    super.initialize()
    this.refresh()
  }

  refresh() {
    this.refs.name.textContent = this.getNameColumnValue()
    this.refs.extension.textContent = this.getExtensionColumnValue()
    this.refs.size.textContent = this.getSizeColumnValue()
    this.refs.date.textContent = this.getDateColumnValue()
  }

  getContainerView(): ContainerView {
    return this.containerView
  }

  getItem(): VItem {
    return this.item
  }

  getNameColumnValue(): string {
    return this.item.getNamePart()
  }

  getExtensionColumnValue(): string {
    return this.item.getExtensionPart()
  }

  getSizeColumnValue(): string {
    return this.item.getFormattedSize()
  }

  getDateColumnValue(): string {
    return this.item.getFormattedModifyDate()
  }

  setSizeColumnVisible(visible: boolean) {
    this.refs.size.style.display = visible ? 'table-cell' : 'none'
  }

  setDateColumnVisible(visible: boolean) {
    this.refs.date.style.display = visible ? 'table-cell' : 'none'
  }

  setExtensionColumnVisible(visible: boolean) {
    this.refs.extension.style.display = visible ? 'table-cell' : 'none'
    this.refresh()
  }

  getPath(): string {
    return this.item.getPath()
  }

  abstract isForParentDirectory(): boolean

  // Override to return the name of this item.
  abstract getName(): string

  // Override to return whether this item is selectable.
  abstract isSelectable(): boolean

  canRename(): boolean {
    return this.item.canRename()
  }

  highlight(highlighted: boolean, focused: boolean) {
    this.highlighted = highlighted
    this.focused = focused
    this.refreshClassList()
  }

  toggleSelect() {
    this.select(!this.selected)
  }

  select(selected: boolean) {
    if (this.isSelectable()) {
      this.selected = selected
      this.refreshClassList()
    }
  }

  refreshClassList() {
    this.removeClass('selected')
    this.removeClass('highlighted-focused')
    this.removeClass('highlighted-unfocused')

    if (this.highlighted) {
      if (this.focused) {
        this.addClass('highlighted-focused')
      } else {
        this.addClass('highlighted-unfocused')
      }
    }

    if (this.selected) {
      this.addClass('selected')
    }
  }

  performOpenAction() {
    this.item.performOpenAction()
  }

}
