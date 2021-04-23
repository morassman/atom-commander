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

  getParent(): SFTPDirectory | undefined {
    return this.getFileSystem().getDirectory(PathUtil.dirname(this.path))
  }

  isWritable(): boolean {
    return this.writable
  }

  isLink(): boolean {
    return this.link
  }

}
