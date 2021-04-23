import { FTPFile } from './ftp-file'
import { FTPDirectory } from './ftp-directory'
import { FTPFileSystem } from './ftp-filesystem'
import { VSymLink } from '../'

const PathUtil = require('path').posix

export class FTPSymLink extends VSymLink {

  baseName: string

  writable: boolean

  constructor(public readonly fileSystem: FTPFileSystem, public readonly path: string, baseName = null) {
    super(fileSystem)
    this.baseName = baseName == null ? PathUtil.basename(this.path) : baseName
    this.writable = true
  }

  getFileSystem(): FTPFileSystem {
    return this.fileSystem as FTPFileSystem
  }

  getRealPathSync(): string {
    return this.path
  }

  getBaseName(): string {
    return this.baseName
  }

  getParent(): FTPDirectory | undefined {
    return this.fileSystem.getDirectory(PathUtil.dirname(this.path))
  }

  isWritable(): boolean {
    return this.writable
  }

  createFileItem(targetPath: string): FTPFile {
    return new FTPFile(this.getFileSystem(), false, targetPath)
  }

  createDirectoryItem(targetPath: string): FTPDirectory {
    return new FTPDirectory(this.getFileSystem(), false, targetPath)
  }
}
