/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let ListItemView;
const BaseItemView = require('./base-item-view');
const {$} = require('atom-space-pen-views');

module.exports =
(ListItemView = class ListItemView extends BaseItemView {

  constructor() {
    super();
  }

  initialize(containerView, index, fileController?) {
    this.index = index;
    super.initialize(containerView, fileController);

    this.name = document.createElement('td');
    this.extension = document.createElement('td');
    this.size = document.createElement('td');
    this.date = document.createElement('td');

    this.extension.classList.add('align-right');
    this.size.classList.add('align-right');
    this.date.classList.add('align-right');

    this.size.textContent = fileController.getFormattedSize();
    this.date.textContent = fileController.getFormattedModifyDate();

    this.appendChild(this.name);
    this.appendChild(this.extension);
    this.appendChild(this.size);
    return this.appendChild(this.date);
  }

  refresh() {
    this.name.textContent = this.getNameColumnValue();
    this.extension.textContent = this.getExtensionColumnValue();
    this.size.textContent = this.getSizeColumnValue();
    return this.date.textContent = this.getDateColumnValue();
  }

  getNameColumnValue() {
    return this.itemController.getNamePart();
  }

  getExtensionColumnValue() {
    return this.itemController.getExtensionPart();
  }

  getSizeColumnValue() {
    return this.itemController.getFormattedSize();
  }

  getDateColumnValue() {
    return this.itemController.getFormattedModifyDate();
  }

  setSizeColumnVisible(visible) {
    if (visible) {
      return $(this.size).show();
    } else {
      return $(this.size).hide();
    }
  }

  setDateColumnVisible(visible) {
    if (visible) {
      return $(this.date).show();
    } else {
      return $(this.date).hide();
    }
  }

  setExtensionColumnVisible(visible) {
    if (visible) {
      $(this.extension).show();
    } else {
      $(this.extension).hide();
    }

    return this.refresh();
  }
});
