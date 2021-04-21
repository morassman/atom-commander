import { ErrorCallback, VFileSystem, VItem } from '.'
import { ReadStreamCallback } from './vfilesystem'
import { ItemNameParts } from './vitem'

export abstract class VFile extends VItem {

  constructor(fileSystem: VFileSystem) {
    super(fileSystem)
  }

  isFile() {
    return true
  }

  isDirectory() {
    return false
  }

  getNamePartsImpl(): ItemNameParts {
    const baseName = this.getBaseName()

    if (!baseName) {
      return {
        name: '',
        ext: ''
      }
    }

    const index = baseName.lastIndexOf('.')
    const lastIndex = baseName.length - 1

    if ((index === -1) || (index === 0) || (index === lastIndex)) {
      return {
        name: baseName,
        ext: ''
      }
    }

    return {
      name: baseName.slice(0, index),
      ext: baseName.slice(index + 1)
    }
  }

  download(localPath: string, callback: ErrorCallback) {
    const taskManager = this.getFileSystem().getTaskManager()

    if (taskManager) {
      taskManager.getFileSystem().download(this.getPath(), localPath, callback)
    }
  }

  upload(localPath: string, callback: ErrorCallback) {
    const taskManager = this.getFileSystem().getTaskManager()

    if (taskManager) {
      taskManager.getFileSystem().upload(localPath, this.getPath(), callback)
    }
  }

  performOpenAction() {
    this.open()
  }

  open() {
    this.fileSystem.openFile(this)
  }

  // Callback receives two arguments:
  // 1.) err : String with error message. null if no error.
  // 2.) stream : A ReadableStream.
  createReadStream(callback: ReadStreamCallback) {
    this.fileSystem.createReadStream(this.getPath(), callback)
  }

}
