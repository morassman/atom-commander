/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let SymLinkController;
const ItemController = require('./item-controller');
const FileController = require('./file-controller');
const DirectoryController = require('./directory-controller');

module.exports =
(SymLinkController = class SymLinkController extends ItemController {

  constructor(symLink) {
    super(symLink);
    this.targetController = null;
  }

  getNamePart() {
    if (this.namePart != null) {
      return this.namePart;
    }
    return super.getNamePart();
  }

  getExtensionPart() {
    if (this.extensionPart != null) {
      return this.extensionPart;
    }
    return super.getExtensionPart();
  }

  getTargetController() {
    return this.targetController;
  }

  getTargetItem() {
    return this.item.getTargetItem();
  }

  refresh() {
    this.refreshTargetController();
    return super.refresh();
  }

  refreshTargetController() {
    const targetItem = this.getTargetItem();

    if ((targetItem == null)) {
      return;
    }

    if (targetItem.isFile()) {
      this.targetController = new FileController(targetItem);
      const ne = this.getNameExtension();
      this.namePart = ne[0];
      this.extensionPart = ne[1];
    } else if (targetItem.isDirectory()) {
      this.targetController = new DirectoryController(targetItem);
      this.namePart = this.item.getBaseName();
      this.extensionPart = null;
    } else {
      this.namePart = null;
      this.extensionPart = null;
    }

    return (this.targetController != null ? this.targetController.initialize(this.getItemView()) : undefined);
  }

  performOpenAction() {
    return (this.targetController != null ? this.targetController.performOpenAction() : undefined);
  }
});
