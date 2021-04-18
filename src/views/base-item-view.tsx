const etch = require('etch')

import { ItemController } from '../controllers/item-controller'
import { VItem } from '../fs'
import { ContainerView } from './container-view'
import { Props, View } from './view'

export abstract class BaseItemView<C extends ItemController<VItem> = ItemController<VItem>, R extends object = {}> extends View<Props, R> {

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

  getContainerView(): ContainerView {
    return this.containerView
  }

  getItemController(): C {
    return this.itemController
  }

  getItem(): VItem {
    return this.itemController.getItem()
  }

  abstract isForParentDirectory(): boolean

  // Called if anything about the item changed.
  abstract refresh(): void

  // Override to return the name of this item.
  abstract getName(): string

  // Override to return the path of this item.
  abstract getPath(): string

  // Override to return whether this item is selectable.
  abstract isSelectable(): boolean

  abstract setSizeColumnVisible(visible: boolean): void

  abstract setDateColumnVisible(visible: boolean): void

  abstract setExtensionColumnVisible(visible: boolean): void

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
