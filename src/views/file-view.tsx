import { FileController } from '../controllers/file-controller'
import { ContainerView } from './container-view'
import { ItemView } from './item-view'

export class FileView extends ItemView<FileController> {

  constructor(containerView: ContainerView, index: number, fileController: FileController) {
    super(containerView, index, fileController)
  }

  initialize() {
    super.initialize()

    this.element.classList.add('file')

    if (this.itemController.isLink()) {
      this.refs.name.classList.add('icon', 'icon-file-symlink-file')
    } else {
      this.refs.name.classList.add('icon', 'icon-file-text')
    }

    this.refs.name.textContent = this.getNameColumnValue()
    this.refs.extension.textContent = this.itemController.getExtensionPart()
  }

  isForParentDirectory(): boolean {
    return false
  }

  getName(): string {
    return this.itemController.getName()
  }

  isSelectable(): boolean {
    return true
  }

  getNameColumnValue(): string {
    if (this.containerView.isExtensionColumnVisible()) {
      return this.itemController.getNamePart()
    }

    return this.itemController.getName()
  }

  getExtensionColumnValue(): string {
    if (this.containerView.isExtensionColumnVisible()) {
      return this.itemController.getExtensionPart()
    }

    return ''
  }

}