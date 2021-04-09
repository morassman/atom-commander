/*
 * decaffeinate suggestions:
 * DS002: Fix invalid constructor
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let TabbedView;
const {View} = require('atom-space-pen-views');
const TabsView = require('./tabs-view');
const ListView = require('./list-view');

module.exports =
(TabbedView = class TabbedView extends View {

  constructor(left) {
    this.left = left;
    super();
    this.tabsView.hide();
    this.tabsView.setTabbedView(this);
    this.selectedView = null;
  }

  static content(left) {
    return this.div({}, () => {
      this.subview("tabsView", new TabsView());
      return this.div({style: "display: flex; flex:1; overflow: auto", outlet: "container"});
  });
  }

  setMainView(mainView) {
    this.mainView = mainView;
  }

  getSelectedView() {
    return this.selectedView;
  }

  getTabCount() {
    return this.tabsView.getTabCount();
  }

  setTabsVisible(visible) {
    if (visible) {
      return this.tabsView.show();
    } else {
      return this.tabsView.hide();
    }
  }

  insertTab() {
    if ((this.selectedView == null)) {
      return;
    }

    const itemView = this.selectedView.getHighlightedItem();

    if (itemView === null) {
      return;
    }

    let item = itemView.getItem();

    if (!item.isDirectory() || !itemView.isSelectable()) {
      item = this.selectedView.directory;
    }

    let index = this.tabsView.getSelectedIndex();

    if (index !== null) {
      index++;
    }

    return this.addTab(item, true, true, index);
  }

  addTab(directory=null, select?, requestFocus?, index=null) {
    if (select == null) { select = false; }
    if (requestFocus == null) { requestFocus = false; }
    const listView = new ListView(this.left);
    listView.setMainView(this.mainView);

    if (directory !== null) {
      listView.openDirectory(directory);
    }

    if (this.selectedView !== null) {
      listView.setContentHeight(this.selectedView.getContentHeight());
    }

    const tabView = this.tabsView.addTab(listView, select, requestFocus, index);
    this.mainView.tabCountChanged();

    return tabView;
  }

  removeSelectedTab() {
    this.tabsView.removeSelectedTab();
    return this.mainView.tabCountChanged();
  }

  previousTab() {
    return this.tabsView.previousTab();
  }

  nextTab() {
    return this.tabsView.nextTab();
  }

  shiftLeft() {
    return this.tabsView.shiftLeft();
  }

  shiftRight() {
    return this.tabsView.shiftRight();
  }

  selectView(view, requestFocus) {
    if (requestFocus == null) { requestFocus = false; }
    if (this.selectedView !== null) {
      this.selectedView.storeScrollTop();
      this.selectedView.detach();
    }

    this.container.append(view);
    this.selectedView = view;
    this.selectedView.restoreScrollTop();

    if (requestFocus) {
      return this.selectedView.requestFocus();
    }
  }

  adjustContentHeight(change) {
    if (this.selectedView === null) {
      return;
    }

    this.selectedView.adjustContentHeight(change);
    return this.tabsView.setContentHeight(this.selectedView.getContentHeight());
  }

  setContentHeight(contentHeight) {
    return this.tabsView.setContentHeight(contentHeight);
  }

  fileSystemRemoved(fileSystem) {
    return this.tabsView.fileSystemRemoved(fileSystem);
  }

  serverClosed(server) {
    return this.tabsView.serverClosed(server);
  }

  setSizeColumnVisible(visible) {
    return Array.from(this.tabsView.getTabViews()).map((tabView) =>
      tabView.getView().setSizeColumnVisible(visible));
  }

  setDateColumnVisible(visible) {
    return Array.from(this.tabsView.getTabViews()).map((tabView) =>
      tabView.getView().setDateColumnVisible(visible));
  }

  setExtensionColumnVisible(visible) {
    return Array.from(this.tabsView.getTabViews()).map((tabView) =>
      tabView.getView().setExtensionColumnVisible(visible));
  }

  serialize() {
    const state = {};
    state.tabs = [];

    for (let tabView of Array.from(this.tabsView.getTabViews())) {
      state.tabs.push(tabView.serialize());
    }

    state.selectedTab = this.tabsView.getSelectedIndex();

    return state;
  }

  deserialize(version, path, state) {
    try {
      if (version === 1) {
        this.deserialize1(path, state);
      } else if (version >= 2) {
        this.deserialize2(state);
      }
    } catch (error) {
      console.error(error);
    }

    if (this.getTabCount() === 0) {
      const fileSystem = this.mainView.getMain().getLocalFileSystem();
      if (path != null) {
        this.addTab(fileSystem.getDirectory(path));
      } else {
        this.addTab(fileSystem.getInitialDirectory());
      }
    }

    if (this.tabsView.getSelectedIndex() === null) {
      return this.tabsView.selectIndex(0);
    }
  }

  deserialize1(path, state) {
    const tabView = this.addTab();
    return tabView.getView().deserialize(path, state);
  }

  deserialize2(state) {
    const fileSystem = this.mainView.getMain().getLocalFileSystem();
    let index = 0;

    return (() => {
      const result = [];
      for (let tab of Array.from(state.tabs)) {
        const tabView = this.addTab();
        tabView.deserialize(tab);

        if (index === state.selectedTab) {
          tabView.select(false);
        }

        result.push(index++);
      }
      return result;
    })();
  }
});
