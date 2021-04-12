import { VFile } from '../fs'
import { ItemController } from './item-controller'

export class FileController extends ItemController<VFile> {

  namePart: string

  extensionPart: string

  constructor(file: VFile) {
    super(file)
  }

  getFile(): VFile {
    return this.item as VFile
  }

  getNamePart() {
    if ((this.namePart == null)) {
      this.refreshNameExtension()
    }
    return this.namePart
  }

  getExtensionPart() {
    if ((this.extensionPart == null)) {
      this.refreshNameExtension()
    }
    return this.extensionPart
  }

  refreshNameExtension() {
    const ne = this.getNameExtension()
    this.namePart = ne[0]
    return this.extensionPart = ne[1]
  }

  performOpenAction() {
    return this.getFile().open()
  }

}
