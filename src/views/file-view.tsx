import { VFile } from '../fs'
import { ContainerView } from './container-view'
import { ItemView } from './item-view'

export class FileView extends ItemView<VFile> {

  constructor(containerView: ContainerView, index: number, file: VFile) {
    super(containerView, index, file)
  }

  initialize() {
    super.initialize()

    this.element.classList.add('file')

    if (this.item.isLink()) {
      this.refs.name.classList.add('icon', 'icon-file-symlink-file')
    } else {
      this.refs.name.classList.add('icon', 'icon-file-text')
    }

    this.refs.name.textContent = this.getNameColumnValue()
    this.refs.extension.textContent = this.item.getExtensionPart()
  }

  isForParentDirectory(): boolean {
    return false
  }

  getName(): string {
    return this.item.getBaseName()
  }

  isSelectable(): boolean {
    return true
  }

  getNameColumnValue(): string {
    if (this.containerView.isExtensionColumnVisible()) {
      return this.item.getNamePart()
    }

    return this.item.getBaseName()
  }

  getExtensionColumnValue(): string {
    if (this.containerView.isExtensionColumnVisible()) {
      return this.item.getExtensionPart()
    }

    return ''
  }

}