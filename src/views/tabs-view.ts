/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let TabsView;
const {View} = require('atom-space-pen-views');
const TabView = require('./tab-view');

module.exports =
(TabsView = class TabsView extends View {

  constructor() {
    super();
    this.tabs = [];
  }

  static content() {
    return this.div({class: "atom-commander-tabs-view inline-block-tight"}, () => {
      return this.div({class: "btn-group btn-group-xs", outlet: "buttonView"});
  });
  }

  setTabbedView(tabbedView) {
    this.tabbedView = tabbedView;
  }

  getTabViews() {
    return this.tabs;
  }

  getTabCount() {
    return this.tabs.length;
  }

  addTab(view, select, requestFocus, index=null) {
    if (select == null) { select = false; }
    if (requestFocus == null) { requestFocus = false; }
    if (index === null) {
      index = this.tabs.length;
    }

    const tabView = new TabView(this, view);

    if (index === this.tabs.length) {
      this.tabs.push(tabView);
      this.buttonView.append(tabView);
    } else {
      const afterTab = this.tabs[index-1];
      this.tabs.splice(index, 0, tabView);
      afterTab.after(tabView);
    }

    if (select) {
      this.selectTab(tabView, requestFocus);
    }

    return tabView;
  }

  removeSelectedTab() {
    if (this.getTabCount() === 1) {
      return;
    }

    let index = this.getSelectedIndex();

    if (index === null) {
      return;
    }

    const tab = this.tabs[index];
    this.tabs.splice(index, 1);

    if (index >= this.tabs.length) {
      index--;
    }

    this.selectIndex(index, true);
    return tab.destroy();
  }

  previousTab() {
    return this.adjustTab(-1);
  }

  nextTab() {
    return this.adjustTab(1);
  }

  adjustTab(change) {
    let index = this.getSelectedIndex();

    if (index === null) {
      return;
    }

    index += change;

    if (index < 0) {
      index = this.tabs.length - 1;
    } else if (index >= this.tabs.length) {
      index = 0;
    }

    return this.selectTab(this.tabs[index]);
  }

  shiftLeft() {
    return this.shiftTab(-1);
  }

  shiftRight() {
    return this.shiftTab(1);
  }

  shiftTab(change) {
    if (this.tabs.length <= 1) {
      return;
    }

    const index = this.getSelectedIndex();

    if (index === null) {
      return;
    }

    const tab = this.tabs[index];
    this.tabs.splice(index, 1);

    const newIndex = index + change;
    tab.detach();

    if (newIndex < 0) {
      this.tabs.push(tab);
      this.buttonView.append(tab);
    } else if (newIndex > this.tabs.length) {
      this.tabs.unshift(tab);
      this.buttonView.prepend(tab);
    } else {
      this.tabs.splice(newIndex, 0, tab);
      if (newIndex === 0) {
        this.tabs[newIndex+1].before(tab);
      } else {
        this.tabs[newIndex-1].after(tab);
      }
    }

    return tab.scrollIntoView();
  }

  getSelectedIndex() {
    let index = 0;

    for (let tab of Array.from(this.tabs)) {
      if (tab.isSelected()) {
        return index;
      }
      index++;
    }

    return null;
  }

  selectIndex(index, requestFocus) {
    if (requestFocus == null) { requestFocus = false; }
    return this.selectTab(this.tabs[index], requestFocus);
  }

  selectTab(tab, requestFocus?) {
    if (requestFocus == null) { requestFocus = true; }
    for (let temp of Array.from(this.tabs)) {
      temp.setSelected(false);
    }

    tab.setSelected(true);
    return this.tabbedView.selectView(tab.getView(), requestFocus);
  }

  adjustContentHeight(change) {
    return Array.from(this.tabs).map((tabView) =>
      tabView.getView().adjustContentHeight(change));
  }

  setContentHeight(contentHeight) {
    return Array.from(this.tabs).map((tabView) =>
      tabView.getView().setContentHeight(contentHeight));
  }

  fileSystemRemoved(fileSystem) {
    return Array.from(this.tabs).map((tabView) =>
      tabView.getView().fileSystemRemoved(fileSystem));
  }

  serverClosed(server) {
    return Array.from(this.tabs).map((tabView) =>
      tabView.getView().serverClosed(server));
  }
});
