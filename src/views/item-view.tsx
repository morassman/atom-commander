const etch = require('etch')

import { ItemController } from '../controllers/item-controller'
import { VItem } from '../fs'
import { ContainerView } from './container-view'
import { Props, View } from './view'

type Refs = {
  
  name: HTMLElement
  
  extension: HTMLElement
  
  size: HTMLElement
  
  date: HTMLElement

}

export abstract class ItemView<C extends ItemController<VItem> = ItemController<VItem>> extends View<Props, Refs> {

  selected: boolean

  highlighted: boolean

  focused: boolean

  itemName: string

  constructor(public readonly containerView: ContainerView, public index: number, public readonly itemController: C) {
    super({}, false)
    this.selected = false
    this.highlighted = false
    this.focused = false
    this.itemName = ''
    this.addClass('item')

    this.initialize()

    this.itemName = this.getName()
    this.itemController.initialize(this)
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

  getItemController(): C {
    return this.itemController
  }

  getItem(): VItem {
    return this.itemController.getItem()
  }

  getNameColumnValue(): string {
    return this.itemController.getNamePart()
  }

  getExtensionColumnValue(): string {
    return this.itemController.getExtensionPart()
  }

  getSizeColumnValue(): string {
    return this.itemController.getFormattedSize()
  }

  getDateColumnValue(): string {
    return this.itemController.getFormattedModifyDate()
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
    return this.itemController.getPath()
  }

  abstract isForParentDirectory(): boolean

  // Override to return the name of this item.
  abstract getName(): string

  // Override to return whether this item is selectable.
  abstract isSelectable(): boolean

  canRename(): boolean {
    return this.itemController.canRename()
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
    this.itemController.performOpenAction()
  }

}
