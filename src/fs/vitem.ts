import { VFileSystem } from './vfilesystem'
import { ItemController } from '../controllers/item-controller'
import { PathDescription } from './path-description'

export abstract class VItem {

  controller: ItemController<VItem>

  modifyDate: Date | null

  size: number | null

  constructor(public readonly fileSystem: VFileSystem) {
    this.modifyDate = null;
    this.size = null;
  }

  setController(controller: ItemController<VItem>) {
    this.controller = controller;
  }

  getController(): ItemController<VItem> {
    return this.controller;
  }

  getFileSystem(): VFileSystem {
    return this.fileSystem;
  }

  getURI(): string {
    return this.fileSystem.getURI(this);
  }

  getPath(): string {
    return this.getRealPathSync();
  }

  delete(callback: (error: string | null) => void) {
    if (this.isFile()) {
      return this.fileSystem.deleteFile(this.getPath(), callback);
    } else if (this.isDirectory()) {
      return this.fileSystem.deleteDirectory(this.getPath(), callback);
    }
  }

  getPathDescription(): PathDescription {
    return {
      isLink: this.isLink(),
      isFile: this.isFile(),
      path: this.getPath(),
      name: this.getBaseName(),
      isLocal: this.fileSystem.isLocal(),
      fileSystemId: this.fileSystem.getID(),
      uri: this.getURI()
    }
  }

  isLocal(): boolean {
    return this.fileSystem.isLocal();
  }

  isRemote(): boolean {
    return this.fileSystem.isRemote();
  }

  getModifyDate() {
    return this.modifyDate;
  }

  getSize() {
    return this.size;
  }

  abstract isFile(): boolean

  abstract isDirectory(): boolean

  abstract isLink(): boolean

  abstract isWritable(): boolean

  abstract existsSync(): boolean

  abstract getRealPathSync(): string

  abstract getBaseName(): string

  // TODO : Return type
  abstract getParent(): any
}
