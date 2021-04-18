const etch = require('etch')

import { ItemController } from '../controllers/item-controller'
import { VItem } from '../fs'
import { BaseItemView } from './base-item-view'
import { ContainerView } from './container-view'

type Refs = {
  
  name: HTMLElement
  
  extension: HTMLElement
  
  size: HTMLElement
  
  date: HTMLElement

}

export abstract class ListItemView<C extends ItemController<VItem>> extends BaseItemView<C, Refs> {

  constructor(containerView: ContainerView, index: number, public readonly itemController: C) {
    super(containerView, index, itemController)
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

}
