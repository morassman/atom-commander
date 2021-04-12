const fs = require('fs')

import { Directory, Disposable } from 'atom'
import { VDirectory } from '../'
import { LocalFileSystem } from './'

export class LocalDirectory extends VDirectory {

  constructor(fileSystem: LocalFileSystem, public directory: Directory) {
    super(fileSystem);
    let stats: any

    if (this.directory.isSymbolicLink()) {
      stats = fs.lstatSync(this.directory.getRealPathSync())
    } else {
      stats = fs.statSync(this.directory.getRealPathSync())
    }

    this.modifyDate = stats.mtime
    this.size = stats.size
  }

  getFileSystem(): LocalFileSystem {
    return super.getFileSystem() as LocalFileSystem
  }

  existsSync() {
    return this.directory.existsSync()
  }

  getRealPathSync() {
    return this.directory.getRealPathSync()
  }

  getBaseName() {
    return this.directory.getBaseName()
  }

  getParent() {
    return new LocalDirectory(this.getFileSystem(), this.directory.getParent())
  }

  isRoot(): boolean {
    return this.directory.isRoot()
  }

  isWritable() {
    return true
  }

  isLink() {
    return this.directory.isSymbolicLink()
  }

  onDidChange(callback: any): Disposable {
    return this.directory.onDidChange(callback)
  }

}
