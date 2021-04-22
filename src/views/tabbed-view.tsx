const etch = require('etch')

import { main, SideState } from '../main'
import { View, Props } from './view'
import { TabsView } from './tabs-view'
import { MainView } from './main-view'
import { ContainerView } from './container-view'
import { TabView } from './tab-view'
import { VDirectory, VFileSystem, VItem } from '../fs'
import { Server } from '../servers/server'
import { Div } from './element-view'

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

  selectedView?: ContainerView

  constructor(props: TabbedViewProps) {
    super(props, false)
    this.mainView = props.mainView
    this.left = props.left

    this.addClass('atom-commander-tabbed-view')

    this.initialize()
  }

  initialize() {
    super.initialize()
    this.refs.tabsView.hide()
  }

  render() {
    return <div {...this.getProps()}>
      <TabsView ref='tabsView' tabbedView={this}/>
      <Div ref='container' style={{display: 'flex', flex: 1, overflow: 'auto'}}/>
    </div>
  }

  // static content(left) {
  //   return this.div({}, () => {
  //     this.subview('tabsView', new TabsView())
  //     return this.div({style: 'display: flex flex:1 overflow: auto', outlet: 'container'})
  // })
  // }

  getSelectedView(): ContainerView | undefined {
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

  insertTab(): TabView | undefined {
    if (!this.selectedView) {
      return undefined
    }

    const itemView = this.selectedView.getHighlightedItem()

    if (!itemView) {
      return undefined
    }

    let item: VItem | undefined = itemView.getItem()

    if (!item.isDirectory() || !itemView.isSelectable()) {
      item = this.selectedView.directory
    }

    let index = this.refs.tabsView.getSelectedIndex()

    if (index !== undefined) {
      index++
    }

    return this.addTab(item as VDirectory, true, true, index)
  }

  addTab(directory?: VDirectory, select=false, requestFocus=false, index?: number): TabView {
    const listView = new ContainerView(this.mainView, this.left)

    if (directory) {
      listView.openDirectory(directory)
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

  deserialize(version: number, path: string | undefined, state: any) {
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

    if (this.refs.tabsView.getSelectedIndex() === undefined) {
      this.refs.tabsView.selectIndex(0)
    }
  }

  deserialize1(path: string | undefined, state: any) {
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
