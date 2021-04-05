/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let DirectoryController;
const ItemController = require('./item-controller');

module.exports =
(DirectoryController = class DirectoryController extends ItemController {

  constructor(directory) {
    super(directory);
  }

  getDirectory() {
    return this.item;
  }

  performOpenAction() {
    return this.getContainerView().openDirectory(this.getDirectory());
  }
});
