const etch = require('etch')

import { FileController } from '../controllers/file-controller'
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
    return <tr className={this.getClassName()} attribute={this.getAttributes()}>
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
    // TODO
    // if (visible) {
    //   return $(this.size).show()
    // } else {
    //   return $(this.size).hide()
    // }
  }

  setDateColumnVisible(visible: boolean) {
    // TODO
    // if (visible) {
    //   return $(this.date).show()
    // } else {
    //   return $(this.date).hide()
    // }
  }

  setExtensionColumnVisible(visible: boolean) {
    // TODO
    // if (visible) {
    //   $(this.extension).show()
    // } else {
    //   $(this.extension).hide()
    // }

    this.refresh()
  }

}
