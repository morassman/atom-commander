/*
 * decaffeinate suggestions:
 * DS002: Fix invalid constructor
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let NewFileDialog;
const fs = require('fs-plus');
const InputDialog = require('@aki77/atom-input-dialog');
const Utils = require('../utils');

module.exports =
(NewFileDialog = class NewFileDialog extends InputDialog {

  constructor(containerView, directory, existingNames) {
    this.containerView = containerView;
    this.directory = directory;
    this.existingNames = existingNames;
    super({prompt:'Enter a name for the new file:'});
  }

  initialize() {
    const options = {};
    options.callback = text => {
      const name = text.trim();
      return this.directory.newFile(name, (file, err) => {
        if (file !== null) {
          this.containerView.refreshDirectory();
          this.containerView.highlightIndexWithName(file.getBaseName());
          return file.open();
        } else {
          return Utils.showErrorWarning("Unable to create file "+name, null, null, err, true);
        }
      });
    };

    options.validate = function(text) {
      const name = text.trim();

      if (name.length === 0) {
        return 'The file name may not be empty.';
      }

      if (this.existingNames.indexOf(name) >= 0) {
        return 'A file or folder with this name already exists.';
      }

      return null;
    };

    return super.initialize(options);
  }
});
