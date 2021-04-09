/*
 * decaffeinate suggestions:
 * DS002: Fix invalid constructor
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let FTPSymLink;
const VSymLink = require('../vsymlink');
const PathUtil = require('path').posix;
const FTPFile = require('./ftp-file');
const FTPDirectory = require('./ftp-directory');

module.exports =
(FTPSymLink = class FTPSymLink extends VSymLink {

  constructor(fileSystem, path, baseName = null) {
    this.path = path;
    this.baseName = baseName;
    super(fileSystem);
    this.writable = true;

    if (this.baseName === null) {
      this.baseName = PathUtil.basename(this.path);
    }
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

  createFileItem(targetPath) {
    return new FTPFile(this.getFileSystem(), false, targetPath);
  }

  createDirectoryItem(targetPath) {
    return new FTPDirectory(this.getFileSystem(), false, targetPath);
  }
});
