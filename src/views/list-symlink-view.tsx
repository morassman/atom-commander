import { SymLinkController } from '../controllers/symlink-controller'
import { ContainerView } from './container-view'
import { ListItemView } from './list-item-view'

export class ListSymLinkView extends ListItemView<SymLinkController> {

  constructor(containerView: ContainerView, index: number, symLinkController: SymLinkController) {
    super(containerView, index, symLinkController)
  }

  initialize() {
    super.initialize()
    this.refresh()
  }

  refresh() {
    super.refresh()

    let targetItem
    const targetController = this.itemController.getTargetController()

    if (targetController != null) {
      targetItem = targetController.getItem()
    }

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
    return this.itemController.getName()
  }

  getPath(): string {
    return this.itemController.getPath()
  }

  getNameColumnValue(): string {
    let targetItem = null
    const targetController = this.itemController.getTargetController()

    if (targetController != null) {
      targetItem = targetController.getItem()
    }

    if ((targetItem == null)) {
      return this.itemController.getName()
    }

    if (targetItem.isDirectory()) {
      return this.itemController.getName()
    }

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

  getSizeColumnValue(): string {
    let targetItem
    const targetController = this.itemController.getTargetController()

    if (targetController != null) {
      targetItem = targetController.getItem()
    }

    if ((targetItem == null)) {
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
