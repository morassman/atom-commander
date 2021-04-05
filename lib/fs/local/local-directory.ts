/*
 * decaffeinate suggestions:
 * DS002: Fix invalid constructor
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let LocalDirectory;
const VDirectory = require('../vdirectory');
const LocalFile = require('./local-file');
const fs = require('fs');

module.exports =
(LocalDirectory = class LocalDirectory extends VDirectory {

  constructor(fileSystem, directory) {
    let stats;
    this.directory = directory;
    super(fileSystem);
    if (this.directory.isSymbolicLink()) {
      stats = fs.lstatSync(this.directory.getRealPathSync());
    } else {
      stats = fs.statSync(this.directory.getRealPathSync());
    }
    this.modifyDate = stats.mtime;
    this.size = stats.size;
  }

  existsSync() {
    return this.directory.existsSync();
  }

  getRealPathSync() {
    return this.directory.getRealPathSync();
  }

  getBaseName() {
    return this.directory.getBaseName();
  }

  getParent() {
    return new LocalDirectory(this.fileSystem, this.directory.getParent());
  }

  isRoot() {
    return this.directory.isRoot();
  }

  isWritable() {
    return true;
  }

  isLink() {
    return this.directory.isSymbolicLink();
  }

  onDidChange(callback) {
    return this.directory.onDidChange(callback);
  }
});
