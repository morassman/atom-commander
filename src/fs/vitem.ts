import { VFileSystem } from './vfilesystem'
import { PathDescription } from './path-description'
import { VDirectory } from './vdirectory'
import { ItemView } from '../views/item-view'

const filesize = require('filesize')

export type ItemNameParts = {
  name: string
  ext: string
}

export abstract class VItem {

  modifyDate?: Date

  size?: number

  view: ItemView

  nameParts: ItemNameParts

  constructor(public readonly fileSystem: VFileSystem) {
  }

  setView(view: ItemView) {
    this.view = view
  }

  getFileSystem(): VFileSystem {
    return this.fileSystem
  }

  getURI(): string {
    return this.fileSystem.getURI(this)
  }

  getPath(): string {
    return this.getRealPathSync()
  }

  delete(callback: (error: string | null) => void) {
    if (this.isFile()) {
      return this.fileSystem.deleteFile(this.getPath(), callback)
    } else if (this.isDirectory()) {
      return this.fileSystem.deleteDirectory(this.getPath(), callback)
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
    return this.fileSystem.isLocal()
  }

  isRemote(): boolean {
    return this.fileSystem.isRemote()
  }

  getModifyDate(): Date | undefined {
    return this.modifyDate
  }

  getSize(): number | undefined {
    return this.size
  }

  canRename(): boolean {
    return this.isWritable()
  }

  getFormattedModifyDate(): string {
    const date = this.getModifyDate()

    if (date) {
      return date.toLocaleDateString()
    }

    return ''
  }

  getFormattedSize(): string {
    const size = this.getSize()

    if (size !== null) {
      return filesize(size)
    }

    return ''
  }

  getNamePart(): string {
    return this.getNameParts().name
  }

  getExtensionPart(): string {
    return this.getNameParts().ext
  }

  getNameParts(): ItemNameParts {
    if (!this.nameParts) {
      this.nameParts = this.getNamePartsImpl()
    }

    return this.nameParts
  }

  refreshView() {
    if (this.view) {
      this.view.refresh()
    }
  }

  abstract getNamePartsImpl(): ItemNameParts

  // Override this to implement the open behavior of this item.
  abstract performOpenAction(): void

  abstract isFile(): boolean

  abstract isDirectory(): boolean

  abstract isLink(): boolean

  abstract isWritable(): boolean

  abstract existsSync(): boolean

  abstract getRealPathSync(): string

  abstract getBaseName(): string

  abstract getParent(): VDirectory | undefined
}
