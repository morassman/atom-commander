/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let VFile;
const VItem = require('./vitem');

module.exports =
(VFile = class VFile extends VItem {

  constructor(fileSystem) {
    super(fileSystem);
  }

  isFile() {
    return true;
  }

  isDirectory() {
    return false;
  }

  download(localPath, callback) {
    const taskManager = this.getFileSystem().getTaskManager();
    return taskManager.getFileSystem().download(this.getPath(), localPath, callback);
  }

  upload(localPath, callback) {
    const taskManager = this.getFileSystem().getTaskManager();
    return taskManager.getFileSystem().upload(localPath, this.getPath(), callback);
  }

  open() {
    return this.fileSystem.openFile(this);
  }

  // Callback receives two arguments:
  // 1.) err : String with error message. null if no error.
  // 2.) stream : A ReadableStream.
  createReadStream(callback) {
    return this.fileSystem.createReadStream(this.getPath(), callback);
  }
});
