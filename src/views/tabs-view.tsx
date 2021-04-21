const etch = require('etch')

import { View, Props } from './view'
import { TabView } from './tab-view'
import { TabbedView } from './tabbed-view'
import { ContainerView } from './container-view'
import { VFileSystem } from '../fs'
import { Server } from '../servers/server'

type TabsViewProps = Props & {

  tabbedView: TabbedView

}

type Refs = {
  buttonView: HTMLElement
}

export class TabsView extends View<TabsViewProps, Refs> {

  tabs: TabView[]

  constructor(props: TabsViewProps) {
    super(props, false)
    this.tabs = []

    this.addClasses(['atom-commander-tabs-view', 'inline-block-tight'])

    this.initialize()
  }

  render() {
    return <div {...this.getProps()}>
      <div ref='buttonView' className='btn-group btn-group-xs' />
    </div>
  }

  getTabViews() {
    return this.tabs
  }

  getTabCount(): number {
    return this.tabs.length
  }

  addTab(view: ContainerView, select=false, requestFocus=false, index:number|null=null): TabView {
    if (index === null) {
      index = this.tabs.length
    }

    const tabView = new TabView(this, view)

    if (index === this.tabs.length) {
      this.tabs.push(tabView)
      this.refs.buttonView.append(tabView.element)
    } else {
      const afterTab = this.tabs[index-1]
      this.tabs.splice(index, 0, tabView)
      afterTab.element.after(tabView.element)
    }

    if (select) {
      this.selectTab(tabView, requestFocus)
    }

    return tabView
  }

  removeSelectedTab() {
    if (this.getTabCount() === 1) {
      return
    }

    let index = this.getSelectedIndex()

    if (index === undefined) {
      return
    }

    const tab = this.tabs[index]
    this.tabs.splice(index, 1)

    if (index >= this.tabs.length) {
      index--
    }

    this.selectIndex(index, true)
    tab.destroy()
  }

  previousTab() {
    this.adjustTab(-1)
  }

  nextTab() {
    this.adjustTab(1)
  }

  adjustTab(change: number) {
    let index = this.getSelectedIndex()

    if (index === undefined) {
      return
    }

    index += change

    if (index < 0) {
      index = this.tabs.length - 1
    } else if (index >= this.tabs.length) {
      index = 0
    }

    this.selectTab(this.tabs[index])
  }

  shiftLeft() {
    this.shiftTab(-1)
  }

  shiftRight() {
    this.shiftTab(1)
  }

  shiftTab(change: number) {
    if (this.tabs.length <= 1) {
      return
    }

    const index = this.getSelectedIndex()

    if (index === undefined) {
      return
    }

    const tab = this.tabs[index]
    this.tabs.splice(index, 1)

    const newIndex = index + change
    tab.element.remove()

    if (newIndex < 0) {
      this.tabs.push(tab)
      this.refs.buttonView.append(tab.element)
    } else if (newIndex > this.tabs.length) {
      this.tabs.unshift(tab)
      this.refs.buttonView.prepend(tab.element)
    } else {
      this.tabs.splice(newIndex, 0, tab)
      if (newIndex === 0) {
        this.tabs[newIndex+1].element.before(tab.element)
      } else {
        this.tabs[newIndex-1].element.after(tab.element)
      }
    }

    tab.scrollIntoView()
  }

  getSelectedIndex(): number | undefined {
    let index = 0

    for (let tab of Array.from(this.tabs)) {
      if (tab.isSelected()) {
        return index
      }
      index++
    }

    return undefined
  }

  selectIndex(index: number, requestFocus=false) {
    this.selectTab(this.tabs[index], requestFocus)
  }

  selectTab(tab: TabView, requestFocus=true) {
    for (let temp of this.tabs) {
      temp.setSelected(false)
    }

    tab.setSelected(true)
    this.props.tabbedView.selectView(tab.getView(), requestFocus)
  }

  fileSystemRemoved(fileSystem: VFileSystem) {
    this.tabs.forEach((tabView) => tabView.getView().fileSystemRemoved(fileSystem))
  }

  serverClosed(server: Server) {
    this.tabs.forEach((tabView) => tabView.getView().serverClosed(server))
  }

}
