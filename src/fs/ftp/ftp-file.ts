import { posix as PathUtil } from 'path'
import { VFile } from '../'
import { FTPDirectory } from './ftp-directory'
import { FTPFileSystem } from './ftp-filesystem'

export class FTPFile extends VFile {

  writable: boolean

  baseName: string

  constructor(fileSystem: FTPFileSystem, public readonly link: boolean, public readonly path: string, baseName?: string) {
    super(fileSystem)
    this.writable = true
    this.baseName = baseName || PathUtil.basename(this.path)
  }

  getFileSystem(): FTPFileSystem {
    return this.fileSystem as FTPFileSystem
  }

  isFile(): boolean {
    return true
  }

  isDirectory(): boolean {
    return false
  }

  existsSync(): boolean {
    return true
  }

  getRealPathSync(): string {
    return this.path
  }

  getBaseName(): string {
    return this.baseName
  }

  getParent(): FTPDirectory | undefined {
    return this.getFileSystem().getDirectory(PathUtil.dirname(this.path))
  }

  isWritable(): boolean {
    return this.writable
  }

  isLink(): boolean {
    return this.link
  }

}
