import { posix as PathUtil } from 'path'
import { VDirectory } from '../'
import { FTPFileSystem } from './ftp-filesystem'

export class FTPDirectory extends VDirectory {

  writable: boolean

  baseName: string

  constructor(fileSystem: FTPFileSystem, public readonly link: boolean, public readonly path: string, baseName?: string) {
    super(fileSystem)
    this.writable = true
    this.baseName = baseName || PathUtil.basename(this.path)
  }

  getFileSystem(): FTPFileSystem {
    return super.getFileSystem() as FTPFileSystem
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

  getParent() {
    return new FTPDirectory(this.getFileSystem(), false, PathUtil.dirname(this.path))
  }

  isRoot() {
    return PathUtil.dirname(this.path) === this.path
  }

  isWritable() {
    return this.writable
  }

  isLink() {
    return this.link
  }

  onDidChange(callback: any) {
    return null
  }

}