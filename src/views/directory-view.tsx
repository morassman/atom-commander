import { VDirectory } from '../fs'
import { ContainerView } from './container-view'
import { ItemView } from './item-view'

export class DirectoryView extends ItemView {

  constructor(containerView: ContainerView, index: number, private readonly parentDirectory: boolean, directory: VDirectory) {
    super(containerView, index, directory)
  }

  initialize() {
    super.initialize()

    this.refs.name.classList.add('directory')
    this.refs.name.textContent = this.getName()
    this.refs.size.textContent = ''

    if (this.parentDirectory) {
      this.refs.name.classList.add('icon', 'icon-arrow-up')
      return this.refs.date.textContent = ''
    } else if (this.item.isLink()) {
      return this.refs.name.classList.add('icon', 'icon-file-symlink-directory')
    } else {
      return this.refs.name.classList.add('icon', 'icon-file-directory')
    }
  }

  isForParentDirectory(): boolean {
    return this.parentDirectory
  }

  getName(): string {
    if (this.parentDirectory) {
      return '..'
    }

    return this.item.getBaseName()
  }

  getNameColumnValue(): string {
    return this.getName()
  }

  getExtensionColumnValue(): string {
    return ''
  }

  getSizeColumnValue(): string {
    return ''
  }

  getDateColumnValue(): string {
    if (this.parentDirectory) {
      return ''
    }

    return super.getDateColumnValue()
  }

  canRename(): boolean {
    if (this.parentDirectory) {
      return false
    }

    return super.canRename()
  }

  isSelectable(): boolean {
    return !this.parentDirectory
  }

  performOpenAction() {
    if (this.parentDirectory) {
      this.getContainerView().openParentDirectory()
    } else {
      super.performOpenAction()
    }
  }
}
