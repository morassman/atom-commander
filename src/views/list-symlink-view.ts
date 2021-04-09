/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let ListSymLinkView;
const ListItemView = require('./list-item-view');

module.exports =
(ListSymLinkView = class ListSymLinkView extends ListItemView {

  constructor() {
    super();
  }

  initialize(containerView, index, symLinkController?) {
    super.initialize(containerView, index, symLinkController);
    return this.refresh();
  }

  refresh() {
    let targetItem;
    super.refresh();

    const targetController = this.itemController.getTargetController();

    if (targetController != null) {
      targetItem = targetController.getItem();
    }

    this.classList.remove('file', 'directory');
    this.name.classList.remove('icon-link');

    if (targetItem != null ? targetItem.isFile() : undefined) {
      this.classList.add('file');
      return this.name.classList.add('icon-file-symlink-file');
    } else if (targetItem != null ? targetItem.isDirectory() : undefined) {
      this.classList.add('directory');
      return this.name.classList.add('icon', 'icon-file-symlink-directory');
    } else {
      return this.name.classList.add('icon', 'icon-link');
    }
  }

  getName() {
    return this.itemController.getName();
  }

  getPath() {
    return this.itemController.getPath();
  }

  getNameColumnValue() {
    let targetItem;
    const targetController = this.itemController.getTargetController();

    if (targetController != null) {
      targetItem = targetController.getItem();
    }

    if ((targetItem == null)) {
      return this.itemController.getName();
    }

    if (targetItem.isDirectory()) {
      return this.itemController.getName();
    }

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

  getSizeColumnValue() {
    let targetItem;
    const targetController = this.itemController.getTargetController();

    if (targetController != null) {
      targetItem = targetController.getItem();
    }

    if ((targetItem == null)) {
      return '';
    }

    if (targetItem.isDirectory()) {
      return '';
    }

    return super.getSizeColumnValue(...arguments);
  }

  isSelectable() {
    return true;
  }
});

module.exports = document.registerElement('list-symlink-view', {prototype: ListSymLinkView.prototype, extends: 'tr'});
