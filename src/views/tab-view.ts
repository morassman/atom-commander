/*
 * decaffeinate suggestions:
 * DS002: Fix invalid constructor
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let TabView;
const {View} = require('atom-space-pen-views');

module.exports =
(TabView = class TabView extends View {

  constructor(tabsView, view) {
    this.tabsView = tabsView;
    this.view = view;
    super();
    this.view.setTabView(this);
  }

  static content() {
    return this.div({class: "atom-commander-tab-view inline-block-tight", click: "select"});
  }

  getView() {
    return this.view;
  }

  destroy() {
    this.view.dispose();
    return this.element.remove();
  }

  getElement() {
    return this.element;
  }

  // Called by the view when the directory has changed.
  directoryChanged() {
    const {
      directory
    } = this.view;

    if (directory === null) {
      return;
    }

    let name = directory.getBaseName();

    if (name.length === 0) {
      const fileSystem = directory.getFileSystem();

      if (fileSystem.isLocal()) {
        name = directory.getURI();
      } else {
        name = fileSystem.getName();
      }
    }

    return this.text(name);
  }

  removeButtonPressed() {}

  select(requestFocus){
    if (requestFocus == null) { requestFocus = true; }
    if (this.isSelected()) {
      return;
    }

    return this.tabsView.selectTab(this, requestFocus);
  }

  setSelected(selected) {
    this.removeClass("atom-commander-tab-view-selected");
    this.removeClass("text-highlight");
    this.removeClass("text-subtle");

    if (selected) {
      this.addClass("atom-commander-tab-view-selected");
      this.addClass("text-highlight");
      return this.element.scrollIntoView();
    } else {
      return this.addClass("text-subtle");
    }
  }

  scrollIntoView() {
    return this.element.scrollIntoView();
  }

  isSelected() {
    return this.hasClass("atom-commander-tab-view-selected");
  }

  serialize() {
    return this.view.serialize();
  }

  deserialize(state) {
    return this.view.deserialize(null, state);
  }
});
