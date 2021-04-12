import { VDirectory, VFile, VItem, VSymLink } from '../fs'
import { DirectoryController } from './directory-controller'
import { FileController } from './file-controller'
import { ItemController } from './item-controller'

export class SymLinkController extends ItemController<VSymLink> {

  targetController: ItemController<VItem> | null

  namePart: string | null

  extensionPart: string | null

  constructor(symLink: VSymLink) {
    super(symLink)
    this.targetController = null
  }

  getNamePart(): string {
    if (this.namePart != null) {
      return this.namePart
    }
    return super.getNamePart()
  }

  getExtensionPart(): string {
    if (this.extensionPart != null) {
      return this.extensionPart
    }
    return super.getExtensionPart()
  }

  getTargetController(): ItemController<VItem> | null {
    return this.targetController
  }

  getTargetItem(): VItem {
    return this.item.getTargetItem()
  }

  refresh() {
    this.refreshTargetController()
    return super.refresh()
  }

  refreshTargetController() {
    const targetItem = this.getTargetItem()

    if ((targetItem == null)) {
      return
    }

    if (targetItem.isFile()) {
      this.targetController = new FileController(targetItem as VFile)
      const ne = this.getNameExtension()
      this.namePart = ne[0]
      this.extensionPart = ne[1]
    } else if (targetItem.isDirectory()) {
      this.targetController = new DirectoryController(targetItem as VDirectory)
      this.namePart = this.item.getBaseName()
      this.extensionPart = null
    } else {
      this.namePart = null
      this.extensionPart = null
    }

    if (this.targetController) {
      this.targetController.initialize(this.getItemView())
    }
  }

  performOpenAction() {
    if (this.targetController) {
      this.targetController.performOpenAction()
    }
  }

}
