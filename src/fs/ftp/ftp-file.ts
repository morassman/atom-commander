import { posix as PathUtil } from 'path'
import { VFile } from '../'
import { FTPFileSystem } from './ftp-filesystem'

export class FTPFile extends VFile {

  writable: boolean

  baseName: string

  constructor(fileSystem: FTPFileSystem, public readonly link: boolean, public readonly path: string, baseName?: string) {
    super(fileSystem)
    this.writable = true
    this.baseName = baseName || PathUtil.basename(this.path)
  }

  isFile() {
    return true
  }

  isDirectory() {
    return false
  }

  existsSync() {
    return true
  }

  getRealPathSync() {
    return this.path
  }

  getBaseName() {
    return this.baseName
  }

  getParent() {
    return this.fileSystem.getDirectory(PathUtil.dirname(this.path))
  }

  isWritable() {
    return this.writable
  }

  isLink() {
    return this.link
  }

}
