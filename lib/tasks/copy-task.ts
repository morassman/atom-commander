/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const fsp = require('fs-plus');
const fse = require('fs-extra');
const path = require('path');
const {Directory, File} = require('atom');

module.exports = function(srcFolderPath, srcNames, dstFolderPath, move) {
  if (move == null) { move = false; }
  const callback = this.async();
  const dstDirectory = new Directory(dstFolderPath);

  try {
    let index = 0;

    for (let srcName of Array.from(srcNames)) {
      const srcPath = path.join(srcFolderPath, srcName);
      const dstPath = path.join(dstFolderPath, srcName);

      const srcIsDir = fsp.isDirectorySync(srcPath);

      // Prevent a folder from being moved into itself.
      const stop = move && (dstPath.indexOf(srcPath) === 0);

      const options = {};
      options.clobber = true;

      if (!stop) {
        // TODO : Prompt user to choose if file should be replaced.
        // The src will be copied if:
        // - src is a folder
        // - src is a file and dst isn't a file
        // if srcIsDir or !fsp.isFileSync(dstPath)
        if (move) {
          fsp.moveSync(srcPath, dstPath);
        } else {
          fse.copySync(srcPath, dstPath, options);
        }

        emit("success", {index});
      }

      index++;
    }
  } catch (error) {
    console.log("Error copying.");
    console.error(error);
  }

  return callback();
};
