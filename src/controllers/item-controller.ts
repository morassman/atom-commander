const filesize = require('filesize')
import { VItem } from '../fs/vitem'

export abstract class ItemController<I extends VItem> {

  itemView: any

  constructor(public readonly item: I) {
    this.item.setController(this)
  }

  initialize(itemView: any) {
    this.itemView = itemView
  }

  // Called if anything about the item changed.
  refresh() {
    if (this.itemView) {
      this.itemView.refresh()
    }
  }

  getItem(): I {
    return this.item
  }

  getItemView() {
    return this.itemView
  }

  getContainerView() {
    return this.itemView.getContainerView()
  }

  getName() {
    return this.item.getBaseName()
  }

  getNamePart() {
    return this.getName()
  }

  getExtensionPart() {
    return ''
  }

  getPath() {
    return this.item.getRealPathSync()
  }

  // Override to indicate if this item can be renamed.
  canRename() {
    return this.item.isWritable()
  }

  isLink() {
    return this.item.isLink()
  }

  getNameExtension() {
    const baseName = this.item.getBaseName()

    if ((baseName == null)) {
      return ['', '']
    }

    const index = baseName.lastIndexOf('.')
    const lastIndex = baseName.length - 1

    if ((index === -1) || (index === 0) || (index === lastIndex)) {
      return [baseName, '']
    }

    return [baseName.slice(0, index), baseName.slice(index + 1)]
  }

  getFormattedModifyDate(): string {
    const date = this.item.getModifyDate()

    if (date !== null) {
      return date.toLocaleDateString()
    }

    return ''
  }

  getFormattedSize(): string {
    const size = this.item.getSize()

    if (size !== null) {
      return filesize(size)
    }

    return ''
  }

  // Override this to implement the open behavior of this item.
  abstract performOpenAction(): void

}
