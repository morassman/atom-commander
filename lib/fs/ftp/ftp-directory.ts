/*
 * decaffeinate suggestions:
 * DS002: Fix invalid constructor
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let FTPDirectory;
const PathUtil = require('path').posix;
const VDirectory = require('../vdirectory');

module.exports =
(FTPDirectory = class FTPDirectory extends VDirectory {

  constructor(fileSystem, link, path, baseName = null) {
    this.link = link;
    this.path = path;
    this.baseName = baseName;
    super(fileSystem);
    this.writable = true;

    if (this.baseName === null) {
      this.baseName = PathUtil.basename(this.path);
    }
  }

  existsSync() {
    return true;
  }

  getRealPathSync() {
    return this.path;
  }

  getBaseName() {
    return this.baseName;
  }

  getParent() {
    return new FTPDirectory(this.fileSystem, false, PathUtil.dirname(this.path));
  }

  isRoot() {
    return PathUtil.dirname(this.path) === this.path;
  }

  isWritable() {
    return this.writable;
  }

  isLink() {
    return this.link;
  }

  onDidChange(callback) {
    return null;
  }
});
    // return @directory.onDidChange(callback);
