/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let ListFileView;
const ListItemView = require('./list-item-view');

module.exports =
(ListFileView = class ListFileView extends ListItemView {

  constructor() {
    super();
  }

  initialize(containerView, index, fileController?) {
    super.initialize(containerView, index, fileController);
    this.classList.add('file');

    if (fileController.isLink()) {
      this.name.classList.add('icon', 'icon-file-symlink-file');
    } else {
      this.name.classList.add('icon', 'icon-file-text');
    }

    this.name.textContent = this.getNameColumnValue();
    return this.extension.textContent = fileController.getExtensionPart();
  }

  getName() {
    return this.itemController.getName();
  }

  getPath() {
    return this.itemController.getPath();
  }

  isSelectable() {
    return true;
  }

  getNameColumnValue() {
    if (this.containerView.isExtensionColumnVisible()) {
      return this.itemController.getNamePart();
    }

    return this.itemController.getName();
  }

  getExtensionColumnValue() {
    if (this.containerView.isExtensionColumnVisible()) {
      return this.itemController.getExtensionPart();
    }

    return '';
  }
});

module.exports = document.registerElement('list-file-view', {prototype: ListFileView.prototype, extends: 'tr'});
