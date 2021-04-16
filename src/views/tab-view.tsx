const etch = require('etch')

import { View } from './view'
import { TabsView } from './tabs-view'
import { ContainerState, ContainerView } from './container-view'

export class TabView extends View {

  constructor(public readonly tabsView: TabsView, public readonly view: ContainerView) {
    super({}, false)
    this.initialize()
    this.view.setTabView(this)
  }

  render() {
    return <div className='atom-commander-tab-view inline-block-tight' on={{click: () => this.select()}}/>
  }

  getView(): ContainerView {
    return this.view
  }

  async destroy() {
    await this.view.destroy()
    await super.destroy()
  }

  // Called by the view when the directory has changed.
  directoryChanged() {
    const {
      directory
    } = this.view

    if (!directory) {
      return
    }

    let name = directory.getBaseName()

    if (name.length === 0) {
      const fileSystem = directory.getFileSystem()

      if (fileSystem.isLocal()) {
        name = directory.getURI()
      } else {
        name = fileSystem.getName()
      }
    }

    this.element.textContent = name
  }

  removeButtonPressed() {}

  select(requestFocus=true){
    if (!this.isSelected()) {
      this.tabsView.selectTab(this, requestFocus)
    }
  }

  setSelected(selected: boolean) {
    this.removeClass('atom-commander-tab-view-selected')
    this.removeClass('text-highlight')
    this.removeClass('text-subtle')

    if (selected) {
      this.addClass('atom-commander-tab-view-selected')
      this.addClass('text-highlight')
      this.element.scrollIntoView()
    } else {
      this.addClass('text-subtle')
    }
  }

  scrollIntoView() {
    this.element.scrollIntoView()
  }

  isSelected() {
    return this.hasClass('atom-commander-tab-view-selected')
  }

  serialize(): ContainerState {
    return this.view.serialize()
  }

  deserialize(state: ContainerState) {
    this.view.deserialize(null, state)
  }

}
