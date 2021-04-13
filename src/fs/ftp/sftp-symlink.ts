import { FTPFile } from './ftp-file'
import { FTPDirectory } from './ftp-directory';
import { FTPFileSystem } from './ftp-filesystem';
import { VSymLink } from '../'
import { SFTPFileSystem } from './sftp-filesystem';
import { SFTPFile } from './sftp-file';
import { SFTPDirectory } from './sftp-directory';

const PathUtil = require('path').posix;

export class SFTPSymLink extends VSymLink {

  baseName: string

  writable: boolean

  constructor(public readonly fileSystem: SFTPFileSystem, public readonly path: string, baseName = null) {
    super(fileSystem)
    this.baseName = baseName == null ? PathUtil.basename(this.path) : baseName
    this.writable = true;
  }

  getFileSystem(): SFTPFileSystem {
    return this.fileSystem as SFTPFileSystem
  }

  getRealPathSync(): string {
    return this.path;
  }

  getBaseName(): string {
    return this.baseName;
  }

  getParent(): SFTPDirectory {
    return this.fileSystem.getDirectory(PathUtil.dirname(this.path));
  }

  isWritable(): boolean {
    return this.writable;
  }

  createFileItem(targetPath: string): SFTPFile {
    return new SFTPFile(this.getFileSystem(), false, targetPath);
  }

  createDirectoryItem(targetPath: string): SFTPDirectory {
    return new SFTPDirectory(this.getFileSystem(), false, targetPath);
  }
}
