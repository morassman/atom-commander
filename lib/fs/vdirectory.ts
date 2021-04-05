/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let VDirectory;
const VItem = require('./vitem');

module.exports =
(VDirectory = class VDirectory extends VItem {

  constructor(fileSystem) {
    super(fileSystem);
  }

  isFile() {
    return false;
  }

  isDirectory() {
    return true;
  }

  isRoot() {}

  // The callback received three parameters :
  // 1.) This directory.
  // 2.) err. null if no error.
  // 3.) The list of entries containing VFile and VDirectory instances.
  getEntries(callback) {
    return this.fileSystem.getEntries(this, callback);
  }

  onDidChange(callback) {}

  getFile(name) {
    const pathUtil = this.fileSystem.getPathUtil();
    return this.fileSystem.getFile(pathUtil.join(this.getPath(), name));
  }

  // The callback receives one parameter :
  // 1.) file : The file that was created. null if it could not be created.
  newFile(name, callback) {
    const pathUtil = this.fileSystem.getPathUtil();
    return this.fileSystem.newFile(pathUtil.join(this.getPath(), name), callback);
  }
});
