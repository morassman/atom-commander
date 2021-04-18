const fs = require('fs')

import { File } from 'atom'
import { VFile } from '../'
import { LocalDirectory, LocalFileSystem } from './'

export class LocalFile extends VFile {

  constructor(fileSystem: LocalFileSystem, public file: File) {
    super(fileSystem)
    this.file = file

    let stats: any

    if (this.file.isSymbolicLink()) {
      stats = fs.lstatSync(this.file.getRealPathSync())
    } else {
      stats = fs.statSync(this.file.getRealPathSync())
    }

    this.modifyDate = stats.mtime
    this.size = stats.size
  }

  getFileSystem(): LocalFileSystem {
    return super.getFileSystem() as LocalFileSystem
  }

  existsSync(): boolean {
    return this.file.existsSync()
  }

  getRealPathSync(): string {
    return this.file.getRealPathSync()
  }

  getBaseName(): string {
    return this.file.getBaseName()
  }

  getParent(): LocalDirectory | null {
    return this.getFileSystem().getDirectory(this.file.getParent().getRealPathSync())
  }

  isWritable(): boolean {
    return true
  }

  isLink(): boolean {
    return this.file.isSymbolicLink()
  }

}
