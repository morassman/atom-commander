const etch = require('etch')

import { main, SideState } from '../main'
import { View, Props } from './view'
import { TabsView } from './tabs-view'
import { MainView } from './main-view'
import { ContainerView } from './container-view'
import { TabView } from './tab-view'
import { VDirectory, VFileSystem, VItem } from '../fs'
import { ListView } from './list-view'
import { Server } from '../servers/server'

class BodyView extends View {

  constructor() {
    super({}, false, 'flex')
    this.style.merge({flex: 1, overflow: 'auto'})
    this.initialize()
  }

  render() {
    return <div attributes={this.getAttributes()}></div>
  }
}

type TabbedViewProps = Props & {
  
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
    return this.refs.tabsView.getTabCount()
  }

  setTabsVisible(visible: boolean) {
    if (visible) {
      this.refs.tabsView.show()
    } else {
      this.refs.tabsView.hide()
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

    let index = this.refs.tabsView.getSelectedIndex()

    if (index !== null) {
      index++
    }

    return this.addTab(item as VDirectory, true, true, index)
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

    const tabView = this.refs.tabsView.addTab(listView, select, requestFocus, index)
    this.mainView.tabCountChanged()

    return tabView
  }

  removeSelectedTab() {
    this.refs.tabsView.removeSelectedTab()
    this.mainView.tabCountChanged()
  }

  previousTab() {
    return this.refs.tabsView.previousTab()
  }

  nextTab() {
    return this.refs.tabsView.nextTab()
  }

  shiftLeft() {
    return this.refs.tabsView.shiftLeft()
  }

  shiftRight() {
    return this.refs.tabsView.shiftRight()
  }

  selectView(view: ContainerView, requestFocus=false) {
    if (this.selectedView) {
      this.selectedView.storeScrollTop()
      this.selectedView.remove()
    }

    this.refs.container.append(view)
    this.selectedView = view
    this.selectedView.restoreScrollTop()

    if (requestFocus) {
      this.selectedView.requestFocus()
    }
  }

  adjustContentHeight(change: number) {
    if (this.selectedView === null) {
      return
    }

    this.selectedView.adjustContentHeight(change)
    this.refs.tabsView.setContentHeight(this.selectedView.getContentHeight())
  }

  setContentHeight(contentHeight: number) {
    this.refs.tabsView.setContentHeight(contentHeight)
  }

  fileSystemRemoved(fileSystem: VFileSystem) {
    this.refs.tabsView.fileSystemRemoved(fileSystem)
  }

  serverClosed(server: Server) {
    this.refs.tabsView.serverClosed(server)
  }

  setSizeColumnVisible(visible: boolean) {
    this.refs.tabsView.getTabViews().forEach((tabView) => {
      tabView.getView().setSizeColumnVisible(visible)
    })
  }

  setDateColumnVisible(visible: boolean) {
    this.refs.tabsView.getTabViews().forEach((tabView) => {
      tabView.getView().setDateColumnVisible(visible)
    })
  }

  setExtensionColumnVisible(visible: boolean) {
    this.refs.tabsView.getTabViews().forEach((tabView) => {
      tabView.getView().setExtensionColumnVisible(visible)
    })
  }

  serialize(): SideState {
    const state: SideState = {
      tabs: [],
      selectedTab: this.refs.tabsView.getSelectedIndex()
    }

    for (let tabView of this.refs.tabsView.getTabViews()) {
      state.tabs.push(tabView.serialize())
    }

    return state
  }

  deserialize(version: number, path: string | null, state: any) {
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
      const fileSystem = main.getLocalFileSystem()
      
      if (path) {
        this.addTab(fileSystem.getDirectory(path))
      } else {
        this.addTab(fileSystem.getInitialDirectory())
      }
    }

    if (this.refs.tabsView.getSelectedIndex() === null) {
      this.refs.tabsView.selectIndex(0)
    }
  }

  deserialize1(path: string | null, state: any) {
    const tabView = this.addTab()
    tabView.getView().deserialize(path, state)
  }

  deserialize2(state: any) {
    let index = 0

    for (let tab of state.tabs) {
      const tabView = this.addTab()
      tabView.deserialize(tab)

      if (index === state.selectedTab) {
        tabView.select(false)
      }

      index++
    }
  }

}
