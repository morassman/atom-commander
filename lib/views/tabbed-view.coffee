{View} = require 'atom-space-pen-views'
TabsView = require './tabs-view'
ListView = require './list-view'

module.exports =
class TabbedView extends View

  constructor: (@left) ->
    super();
    @tabsView.hide();
    @tabsView.setTabbedView(@);
    @selectedView = null;

  @content: (left) ->
    @div {}, =>
      @subview "tabsView", new TabsView()
      @div {style: "display: flex; flex:1", outlet: "container"}

  setMainView: (@mainView) ->

  getSelectedView: ->
    return @selectedView;

  getTabCount: ->
    return @tabsView.getTabCount();

  setTabsVisible: (visible) ->
    if visible
      @tabsView.show();
    else
      @tabsView.hide();

  insertTab: ->
    if !@selectedView?
      return;

    itemView = @selectedView.getHighlightedItem();

    if (itemView == null)
      return;

    item = itemView.getItem();

    if !item.isDirectory() or !itemView.isSelectable()
      item = @selectedView.directory;

    index = @tabsView.getSelectedIndex();

    if index != null
      index++;

    @addTab(item, true, true, index);

  addTab: (directory=null, select=false, requestFocus=false, index=null) ->
    listView = new ListView(@left);
    listView.setMainView(@mainView);

    if directory != null
      listView.openDirectory(directory);

    if @selectedView != null
      listView.setContentHeight(@selectedView.getContentHeight());

    tabView = @tabsView.addTab(listView, select, requestFocus, index);
    @mainView.tabCountChanged();

    return tabView;

  removeSelectedTab: ->
    @tabsView.removeSelectedTab();
    @mainView.tabCountChanged();

  previousTab: ->
    @tabsView.previousTab();

  nextTab: ->
    @tabsView.nextTab();

  shiftLeft: ->
    @tabsView.shiftLeft();

  shiftRight: ->
    @tabsView.shiftRight();

  selectView: (view, requestFocus=false) ->
    if @selectedView != null
      @selectedView.storeScrollTop();
      @selectedView.detach();

    @container.append(view);
    @selectedView = view;
    @selectedView.restoreScrollTop();

    if (requestFocus)
      @selectedView.requestFocus();

  adjustContentHeight: (change) ->
    if @selectedView == null
      return;

    @selectedView.adjustContentHeight(change);
    @tabsView.setContentHeight(@selectedView.getContentHeight());

  setContentHeight: (contentHeight) ->
    @tabsView.setContentHeight(contentHeight);

  fileSystemRemoved: (fileSystem) ->
    @tabsView.fileSystemRemoved(fileSystem);

  serverClosed: (server) ->
    @tabsView.serverClosed(server);

  setSizeColumnVisible: (visible) ->
    for tabView in @tabsView.getTabViews()
      tabView.getView().setSizeColumnVisible(visible);

  setDateColumnVisible: (visible) ->
    for tabView in @tabsView.getTabViews()
      tabView.getView().setDateColumnVisible(visible);

  setExtensionColumnVisible: (visible) ->
    for tabView in @tabsView.getTabViews()
      tabView.getView().setExtensionColumnVisible(visible);

  serialize: ->
    state = {};
    state.tabs = [];

    for tabView in @tabsView.getTabViews()
      state.tabs.push(tabView.serialize());

    state.selectedTab = @tabsView.getSelectedIndex();

    return state;

  deserialize: (version, path, state) ->
    try
      if version == 1
        @deserialize1(path, state);
      else if version >= 2
        @deserialize2(state);
    catch error
      console.error(error);

    if @getTabCount() == 0
      fileSystem = @mainView.getMain().getLocalFileSystem();
      if path?
        @addTab(fileSystem.getDirectory(path));
      else
        @addTab(fileSystem.getInitialDirectory());

    if @tabsView.getSelectedIndex() == null
      @tabsView.selectIndex(0);

  deserialize1: (path, state) ->
    tabView = @addTab();
    tabView.getView().deserialize(path, state);

  deserialize2: (state) ->
    fileSystem = @mainView.getMain().getLocalFileSystem();
    index = 0;

    for tab in state.tabs
      tabView = @addTab();
      tabView.deserialize(tab);

      if index == state.selectedTab
        tabView.select(false);

      index++;
