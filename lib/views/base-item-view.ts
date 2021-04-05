/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let BaseItemView;
module.exports =
(BaseItemView = class BaseItemView extends HTMLElement {

  constructor() {
    super();
    this.selected = false;
    this.highlighted = false;
    this.focused = false;
    this.itemName = '';
  }

  initialize(containerView, itemController) {
    this.containerView = containerView;
    this.itemController = itemController;
    this.itemController.initialize(this);
    this.classList.add('item');
    return this.itemName = this.getName();
  }

  getContainerView() {
    return this.containerView;
  }

  getItemController() {
    return this.itemController;
  }

  getItem() {
    return this.itemController.getItem();
  }

  // Called if anything about the item changed.
  refresh() {}

  // Override to return the name of this item.
  getName() {}

  // Override to return the path of this item.
  getPath() {}

  // Override to return whether this item is selectable.
  isSelectable() {}

  setSizeColumnVisible(visible) {}

  canRename() {
    return this.itemController.canRename();
  }

  highlight(highlighted, focused) {
    this.highlighted = highlighted;
    this.focused = focused;
    return this.refreshClassList();
  }

  toggleSelect() {
    return this.select(!this.selected);
  }

  select(selected) {
    if (this.isSelectable()) {
      this.selected = selected;
      return this.refreshClassList();
    }
  }

  refreshClassList() {
    this.classList.remove('selected');
    this.classList.remove('highlighted-focused');
    this.classList.remove('highlighted-unfocused');

    if (this.highlighted) {
      if (this.focused) {
        this.classList.add('highlighted-focused');
      } else {
        this.classList.add('highlighted-unfocused');
      }
    }

    if (this.selected) {
      return this.classList.add('selected');
    }
  }

  performOpenAction() {
    return this.itemController.performOpenAction();
  }
});
