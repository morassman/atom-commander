{View} = require 'atom-space-pen-views'
TabView = require './tab-view'

module.exports =
class TabsView extends View

  constructor: ->
    super();
    @tabs = [];

  @content: ->
    @div {class: "atom-commander-tabs-view inline-block-tight"}, =>
      @div {class: "btn-group btn-group-xs", outlet: "buttonView"}

  setTabbedView: (@tabbedView) ->

  getTabViews: ->
    return @tabs;

  getTabCount: ->
    return @tabs.length;

  addTab: (view, select=false, requestFocus=false, index=null) ->
    if index == null
      index = @tabs.length;

    tabView = new TabView(@, view);

    if index == @tabs.length
      @tabs.push(tabView);
      @buttonView.append(tabView);
    else
      afterTab = @tabs[index-1];
      @tabs.splice(index, 0, tabView);
      afterTab.after(tabView);

    if select
      @selectTab(tabView, requestFocus);

    return tabView;

  removeSelectedTab: ->
    if @getTabCount() == 1
      return;

    index = @getSelectedIndex();

    if index == null
      return;

    tab = @tabs[index];
    @tabs.splice(index, 1);

    if index >= @tabs.length
      index--;

    @selectIndex(index, true);
    tab.destroy();

  previousTab: ->
    @adjustTab(-1);

  nextTab: ->
    @adjustTab(1);

  adjustTab: (change) ->
    index = @getSelectedIndex();

    if index == null
      return;

    index += change;

    if index < 0
      index = @tabs.length - 1;
    else if index >= @tabs.length
      index = 0;

    @selectTab(@tabs[index]);

  shiftLeft: ->
    @shiftTab(-1);

  shiftRight: ->
    @shiftTab(1);

  shiftTab: (change) ->
    if @tabs.length <= 1
      return;

    index = @getSelectedIndex();

    if index == null
      return;

    tab = @tabs[index];
    @tabs.splice(index, 1);

    newIndex = index + change;
    tab.detach();

    if newIndex < 0
      @tabs.push(tab);
      @buttonView.append(tab);
    else if newIndex > @tabs.length
      @tabs.unshift(tab);
      @buttonView.prepend(tab);
    else
      @tabs.splice(newIndex, 0, tab);
      if newIndex == 0
        @tabs[newIndex+1].before(tab);
      else
        @tabs[newIndex-1].after(tab);

    tab.scrollIntoView();

  getSelectedIndex: ->
    index = 0;

    for tab in @tabs
      if tab.isSelected()
        return index;
      index++;

    return null;

  selectIndex: (index, requestFocus=false) ->
    @selectTab(@tabs[index], requestFocus);

  selectTab: (tab, requestFocus=true) ->
    for temp in @tabs
      temp.setSelected(false);

    tab.setSelected(true);
    @tabbedView.selectView(tab.getView(), requestFocus);

  adjustContentHeight: (change) ->
    for tabView in @tabs
      tabView.getView().adjustContentHeight(change);

  setContentHeight: (contentHeight) ->
    for tabView in @tabs
      tabView.getView().setContentHeight(contentHeight);

  fileSystemRemoved: (fileSystem) ->
    for tabView in @tabs
      tabView.getView().fileSystemRemoved(fileSystem);

  serverClosed: (server) ->
    for tabView in @tabs
      tabView.getView().serverClosed(server);
