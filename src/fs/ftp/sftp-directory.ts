import { Disposable } from 'atom'
import { posix as PathUtil } from 'path'
import { VDirectory } from '../'
import { SFTPFileSystem } from './sftp-filesystem'

export class SFTPDirectory extends VDirectory {

  writable: boolean

  baseName: string

  constructor(fileSystem: SFTPFileSystem, public readonly link: boolean, public readonly path: string, baseName?: string) {
    super(fileSystem)
    this.writable = true
    this.baseName = baseName || PathUtil.basename(this.path)
  }

  getFileSystem(): SFTPFileSystem {
    return super.getFileSystem() as SFTPFileSystem
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
    return new SFTPDirectory(this.getFileSystem(), false, PathUtil.dirname(this.path))
  }

  isRoot(): boolean {
    return PathUtil.dirname(this.path) === this.path
  }

  isWritable(): boolean {
    return this.writable
  }

  isLink(): boolean {
    return this.link
  }

  onDidChange(callback: ()=>void): Disposable | undefined {
    return undefined
  }

}