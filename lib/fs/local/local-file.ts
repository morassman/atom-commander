/*
 * decaffeinate suggestions:
 * DS002: Fix invalid constructor
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let LocalFile;
const VFile = require('../vfile');
const fs = require('fs');

module.exports =
(LocalFile = class LocalFile extends VFile {

  constructor(fileSystem, file) {
    let stats;
    this.file = file;
    super(fileSystem);
    if (this.file.isSymbolicLink()) {
      stats = fs.lstatSync(this.file.getRealPathSync());
    } else {
      stats = fs.statSync(this.file.getRealPathSync());
    }
    this.modifyDate = stats.mtime;
    this.size = stats.size;
  }

  existsSync() {
    return this.file.existsSync();
  }

  getRealPathSync() {
    return this.file.getRealPathSync();
  }

  getBaseName() {
    return this.file.getBaseName();
  }

  getParent() {
    return this.fileSystem.getDirectory(this.file.getParent().getRealPathSync());
  }

  isWritable() {
    return true;
  }

  isLink() {
    return this.file.isSymbolicLink();
  }
});
