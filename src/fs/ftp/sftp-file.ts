import { posix as PathUtil } from 'path'
import { VFile } from '../'
import { SFTPDirectory } from './sftp-directory'
import { SFTPFileSystem } from './sftp-filesystem'

export class SFTPFile extends VFile {

  writable: boolean

  baseName: string

  constructor(fileSystem: SFTPFileSystem, public readonly link: boolean, public readonly path: string, baseName?: string) {
    super(fileSystem)
    this.writable = true
    this.baseName = baseName || PathUtil.basename(this.path)
  }

  getFileSystem(): SFTPFileSystem {
    return this.fileSystem as SFTPFileSystem
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

  getParent(): SFTPDirectory | null {
    return this.getFileSystem().getDirectory(PathUtil.dirname(this.path))
  }

  isWritable() {
    return this.writable
  }

  isLink() {
    return this.link
  }

}
