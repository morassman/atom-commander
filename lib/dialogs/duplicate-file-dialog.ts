/*
 * decaffeinate suggestions:
 * DS002: Fix invalid constructor
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let DuplicateFileDialog;
const Utils = require('../utils');
const fse = require('fs-extra');
const InputDialog = require('@aki77/atom-input-dialog');

module.exports =
(DuplicateFileDialog = class DuplicateFileDialog extends InputDialog {

  constructor(containerView, item) {
    this.containerView = containerView;
    this.item = item;
    super({prompt:'Enter a name for the duplicate:'});
  }

  initialize() {
    this.directory = this.item.getParent();

    const options = {};
    options.defaultText = this.item.getBaseName();

    options.callback = text => {
      const name = text.trim();
      const pathUtil = this.directory.getFileSystem().getPathUtil();
      const newPath = pathUtil.join(this.directory.getPath(), name);

      return fse.copy(this.item.getPath(), newPath, function(err) {
        if (err != null) {
          return Utils.showWarning("Error duplicating "+this.item.getPath()+".", err.message, true);
        }
      });
    };

    options.validate = function(text) {
      const name = text.trim();

      if (name.length === 0) {
        return 'The name may not be empty.';
      }

      const existingItemView = this.containerView.getItemViewWithName(name);

      if (existingItemView === null) {
        return null;
      }

      const existingItem = existingItemView.getItem();

      if (existingItem.isFile()) {
        return "A file with this name already exists.";
      } else if (existingItem.isDirectory()) {
        return "A folder with this name already exists.";
      }

      return null;
    };

    return super.initialize(options);
  }
});
