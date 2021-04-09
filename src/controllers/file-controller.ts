/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let FileController;
const ItemController = require('./item-controller');

module.exports =
(FileController = class FileController extends ItemController {

  constructor(file) {
    super(file);
  }

  getFile() {
    return this.item;
  }

  getNamePart() {
    if ((this.namePart == null)) {
      this.refreshNameExtension();
    }
    return this.namePart;
  }

  getExtensionPart() {
    if ((this.extensionPart == null)) {
      this.refreshNameExtension();
    }
    return this.extensionPart;
  }

  refreshNameExtension() {
    const ne = this.getNameExtension();
    this.namePart = ne[0];
    return this.extensionPart = ne[1];
  }

  performOpenAction() {
    return this.getFile().open();
  }
});
