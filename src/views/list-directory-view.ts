/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let ListDirectoryView;
const ListItemView = require('./list-item-view');

module.exports =
(ListDirectoryView = class ListDirectoryView extends ListItemView {

  constructor() {
    super();
  }

  initialize(containerView, index, parentDirectory?, directoryController?) {
    this.parentDirectory = parentDirectory;
    super.initialize(containerView, index, directoryController);

    // @name.classList.add('directory');
    this.name.className += ' directory';
    this.name.textContent = this.getName();
    this.size.textContent = '';

    if (this.parentDirectory) {
      this.name.classList.add('icon', 'icon-arrow-up');
      return this.date.textContent = '';
    } else if (directoryController.isLink()) {
      return this.name.classList.add('icon', 'icon-file-symlink-directory');
    } else {
      return this.name.classList.add('icon', 'icon-file-directory');
    }
  }

  isForParentDirectory() {
    return this.parentDirectory;
  }

  getName() {
    if (this.parentDirectory) {
      return "..";
    }

    return this.itemController.getName();
  }

  getNameColumnValue() {
    return this.getName();
  }

  getExtensionColumnValue() {
    return '';
  }

  getSizeColumnValue() {
    return '';
  }

  getDateColumnValue() {
    if (this.parentDirectory) {
      return '';
    }

    return super.getDateColumnValue(...arguments);
  }

  canRename() {
    if (this.parentDirectory) {
      return false;
    }

    return super.canRename();
  }

  getPath() {
    return this.itemController.getPath();
  }

  isSelectable() {
    return !this.parentDirectory;
  }

  performOpenAction() {
    if (this.parentDirectory) {
      return this.getContainerView().openParentDirectory();
    } else {
      return super.performOpenAction();
    }
  }
});

module.exports = document.registerElement('list-directory-view', {prototype: ListDirectoryView.prototype, extends: 'tr'});
