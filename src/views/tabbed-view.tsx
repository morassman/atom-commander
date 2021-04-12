const etch = require('etch')

import { Props, View, ViewProps } from './view'
import { TabsView } from './tabs-view'
import { MainView } from './main-view'
import { ContainerView } from './container-view'
import { TabView } from './tab-view'
import { VDirectory, VItem } from '../fs'
import { ListView } from './list-view'

class BodyView extends View {

  constructor() {
    super({}, false, 'flex')
    this.style.merge({flex: 1, overflow: 'auto'})
  }

  render() {
    return <div attributes={this.getAttributes()}></div>
  }
}

type TabbedViewProps = ViewProps & {
  
  mainView: MainView
  
  left: boolean

}

type Refs = {
  
  tabsView: TabsView
  
  container: ContainerView

}

export class TabbedView extends View<TabbedViewProps, Refs> {

  mainView: MainView

  left: boolean

  tabsView: TabsView

  container: BodyView

  selectedView: ContainerView | null

  constructor(props: TabbedViewProps) {
    super(props, false)
    this.mainView = props.mainView
    this.left = props.left
    this.selectedView = null
    this.initialize()
  }

  initialize() {
    super.initialize()
    this.refs.tabsView.hide()
  }

  render() {
    return <div>
      <TabsView ref='tabsView' tabbedView={this}/>
      <BodyView ref='container'/>
    </div>
  }

  // static content(left) {
  //   return this.div({}, () => {
  //     this.subview('tabsView', new TabsView())
  //     return this.div({style: 'display: flex flex:1 overflow: auto', outlet: 'container'})
  // })
  // }

  getSelectedView(): ContainerView | null {
    return this.selectedView
  }

  getTabCount(): number {
    return this.tabsView.getTabCount()
  }

  setTabsVisible(visible: boolean) {
    if (visible) {
      this.tabsView.show()
    } else {
      this.tabsView.hide()
    }
  }

  insertTab(): TabView | null {
    if (!this.selectedView) {
      return null
    }

    const itemView = this.selectedView.getHighlightedItem()

    if (itemView === null) {
      return null
    }

    let item: VItem | null = itemView.getItem()

    if (!item.isDirectory() || !itemView.isSelectable()) {
      item = this.selectedView.directory
    }

    let index = this.tabsView.getSelectedIndex()

    if (index !== null) {
      index++
    }

    return this.addTab(item, true, true, index)
  }

  addTab(directory: VDirectory|null=null, select=false, requestFocus=false, index:number|null=null) {
    const listView = new ListView(this.left)
    listView.setMainView(this.mainView)

    if (directory !== null) {
      listView.openDirectory(directory)
    }

    if (this.selectedView !== null) {
      listView.setContentHeight(this.selectedView.getContentHeight())
    }

    const tabView = this.tabsView.addTab(listView, select, requestFocus, index)
    this.mainView.tabCountChanged()

    return tabView
  }

  removeSelectedTab() {
    this.tabsView.removeSelectedTab()
    this.mainView.tabCountChanged()
  }

  previousTab() {
    return this.tabsView.previousTab()
  }

  nextTab() {
    return this.tabsView.nextTab()
  }

  shiftLeft() {
    return this.tabsView.shiftLeft()
  }

  shiftRight() {
    return this.tabsView.shiftRight()
  }

  selectView(view, requestFocus) {
    if (requestFocus == null) { requestFocus = false }
    if (this.selectedView !== null) {
      this.selectedView.storeScrollTop()
      this.selectedView.detach()
    }

    this.container.append(view)
    this.selectedView = view
    this.selectedView.restoreScrollTop()

    if (requestFocus) {
      return this.selectedView.requestFocus()
    }
  }

  adjustContentHeight(change) {
    if (this.selectedView === null) {
      return
    }

    this.selectedView.adjustContentHeight(change)
    return this.tabsView.setContentHeight(this.selectedView.getContentHeight())
  }

  setContentHeight(contentHeight) {
    return this.tabsView.setContentHeight(contentHeight)
  }

  fileSystemRemoved(fileSystem) {
    return this.tabsView.fileSystemRemoved(fileSystem)
  }

  serverClosed(server) {
    return this.tabsView.serverClosed(server)
  }

  setSizeColumnVisible(visible) {
    return Array.from(this.tabsView.getTabViews()).map((tabView) =>
      tabView.getView().setSizeColumnVisible(visible))
  }

  setDateColumnVisible(visible) {
    return Array.from(this.tabsView.getTabViews()).map((tabView) =>
      tabView.getView().setDateColumnVisible(visible))
  }

  setExtensionColumnVisible(visible) {
    return Array.from(this.tabsView.getTabViews()).map((tabView) =>
      tabView.getView().setExtensionColumnVisible(visible))
  }

  serialize() {
    const state = {}
    state.tabs = []

    for (let tabView of Array.from(this.tabsView.getTabViews())) {
      state.tabs.push(tabView.serialize())
    }

    state.selectedTab = this.tabsView.getSelectedIndex()

    return state
  }

  deserialize(version, path, state) {
    try {
      if (version === 1) {
        this.deserialize1(path, state)
      } else if (version >= 2) {
        this.deserialize2(state)
      }
    } catch (error) {
      console.error(error)
    }

    if (this.getTabCount() === 0) {
      const fileSystem = this.mainView.getMain().getLocalFileSystem()
      if (path != null) {
        this.addTab(fileSystem.getDirectory(path))
      } else {
        this.addTab(fileSystem.getInitialDirectory())
      }
    }

    if (this.tabsView.getSelectedIndex() === null) {
      return this.tabsView.selectIndex(0)
    }
  }

  deserialize1(path: string, state) {
    const tabView = this.addTab()
    return tabView.getView().deserialize(path, state)
  }

  deserialize2(state) {
    const fileSystem = this.mainView.getMain().getLocalFileSystem()
    let index = 0

    return (() => {
      const result = []
      for (let tab of Array.from(state.tabs)) {
        const tabView = this.addTab()
        tabView.deserialize(tab)

        if (index === state.selectedTab) {
          tabView.select(false)
        }

        result.push(index++)
      }
      return result
    })()
  }

}
