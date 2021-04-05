/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const fsp = require('fs-plus');
const fse = require('fs-extra');
const path = require('path');

module.exports = function(folderPath, names) {
  const callback = this.async();

  try {
    for (let name of Array.from(names)) {
      const p = path.join(folderPath, name);
      fse.removeSync(p);
    }
  } catch (error) {
    console.log("Error deleting.");
    console.error(error);
  }

  return callback();
};
