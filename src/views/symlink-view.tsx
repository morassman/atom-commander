import { VSymLink } from '../fs'
import { ContainerView } from './container-view'
import { ItemView } from './item-view'

export class SymLinkView extends ItemView<VSymLink> {

  constructor(containerView: ContainerView, index: number, symLink: VSymLink) {
    super(containerView, index, symLink)
  }

  initialize() {
    super.initialize()
    this.refresh()
  }

  refresh() {
    super.refresh()

    const targetItem = this.item.getTargetItem()

    this.element.classList.remove('file', 'directory')
    this.refs.name.classList.remove('icon-link')

    if (targetItem != null ? targetItem.isFile() : undefined) {
      this.element.classList.add('file')
      this.refs.name.classList.add('icon-file-symlink-file')
    } else if (targetItem != null ? targetItem.isDirectory() : undefined) {
      this.element.classList.add('directory')
      this.refs.name.classList.add('icon', 'icon-file-symlink-directory')
    } else {
      this.refs.name.classList.add('icon', 'icon-link')
    }
  }

  isForParentDirectory(): boolean {
    return false
  }

  getName(): string {
    return this.item.getBaseName()
  }

  getNameColumnValue(): string {
    const targetItem = this.item.getTargetItem()

    if (!targetItem) {
      return this.item.getBaseName()
    }

    if (targetItem.isDirectory()) {
      return this.item.getBaseName()
    }

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

  getSizeColumnValue(): string {
    const targetItem = this.item.targetItem

    if (!targetItem) {
      return ''
    }

    if (targetItem.isDirectory()) {
      return ''
    }

    return super.getSizeColumnValue()
  }

  isSelectable(): boolean {
    return true
  }

}
