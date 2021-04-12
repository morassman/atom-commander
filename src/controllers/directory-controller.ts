import { VDirectory } from '../fs'
import { ItemController } from './item-controller'

export class DirectoryController extends ItemController<VDirectory> {

  constructor(directory: VDirectory) {
    super(directory)
  }

  getDirectory() {
    return this.item
  }

  performOpenAction() {
    return this.getContainerView().openDirectory(this.getDirectory())
  }

}

