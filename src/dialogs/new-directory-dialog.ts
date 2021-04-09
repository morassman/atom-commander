/*
 * decaffeinate suggestions:
 * DS002: Fix invalid constructor
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let NewDirectoryDialog;
const fs = require('fs-plus');
const InputDialog = require('@aki77/atom-input-dialog');

module.exports =
(NewDirectoryDialog = class NewDirectoryDialog extends InputDialog {

  constructor(containerView, directory) {
    this.containerView = containerView;
    this.directory = directory;
    super({prompt:"Enter a name for the new folder:"});
  }

  initialize() {
    const options = {};
    const pathUtil = this.directory.getFileSystem().getPathUtil();
    
    options.callback = text => {
      const name = text.trim();
      const path = pathUtil.join(this.directory.getPath(), name);

      return this.directory.fileSystem.makeDirectory(path, err => {
        if (err != null) {
          return atom.notifications.addWarning(err);
        } else {
          const snapShot = {};
          snapShot.name = name;
          return this.containerView.refreshDirectoryWithSnapShot(snapShot);
        }
      });
    };

    options.validate = function(text) {
      const name = text.trim();

      if (name.length === 0) {
        return "The folder name may not be empty.";
      }

      if (this.directory.fileSystem.isLocal()) {
        if (fs.isDirectorySync(pathUtil.join(this.directory.getPath(), name))) {
          return "A folder with this name already exists.";
        }
      }

      return null;
    };

    return super.initialize(options);
  }
});
