/*
 * decaffeinate suggestions:
 * DS002: Fix invalid constructor
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let RenameDialog;
const InputDialog = require('@aki77/atom-input-dialog');

module.exports =
(RenameDialog = class RenameDialog extends InputDialog {

  // item : Either a File or a Directory.
  constructor(containerView, item) {
    this.containerView = containerView;
    this.item = item;
    super({prompt:'Enter a new name:'});
  }

  initialize() {
    this.itemName = this.item.getBaseName();
    this.oldPath = this.item.getRealPathSync();
    this.directoryPath = this.item.getParent().getRealPathSync();

    const options = {};
    options.defaultText = this.itemName;
    const pathUtil = this.item.getFileSystem().getPathUtil();

    options.callback = text => {
      const name = text.trim();
      const newPath = pathUtil.join(this.directoryPath, name);

      if (this.oldPath === newPath) {
        return;
      }

      this.item.fileSystem.rename(this.oldPath, newPath, err => {
        if (err != null) {
          return atom.notifications.addWarning(err);
        } else {
          // TODO : It's not necessary to refresh the whole directory. Just update the item.
          return this.containerView.refreshDirectory();
        }
      });

      return this.containerView.requestFocus();
    };

    options.validate = function(text) {
      const name = text.trim();

      if (name === this.itemName) {
        return null;
      }

      if (name.length === 0) {
        return "The name may not be empty.";
      }

      const parsed = pathUtil.parse(name);

      if (parsed.dir !== "") {
        return "The name should not contain a parent.";
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
