/*
 * decaffeinate suggestions:
 * DS002: Fix invalid constructor
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let FTPFile;
const PathUtil = require('path').posix;
const VFile = require('../vfile');

module.exports =
(FTPFile = class FTPFile extends VFile {

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

  isFile() {
    return true;
  }

  isDirectory() {
    return false;
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
    return this.fileSystem.getDirectory(PathUtil.dirname(this.path));
  }

  isWritable() {
    return this.writable;
  }

  isLink() {
    return this.link;
  }
});
