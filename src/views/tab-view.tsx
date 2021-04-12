const etch = require('etch')

import { View } from './view'
import { TabsView } from './tabs-view'
import { ContainerView } from './container-view'

export class TabView extends View {

  constructor(public readonly tabsView: TabsView, public readonly view: ContainerView) {
    super({}, false)
    this.view.setTabView(this)
    this.initialize()
  }

  render() {
    return <div className='atom-commander-tab-view inline-block-tight' on={{click: () => this.select()}}/>
  }

  getView(): ContainerView {
    return this.view
  }

  destroy() {
    this.view.destroy()
    super.destroy()
  }

  // Called by the view when the directory has changed.
  directoryChanged() {
    const {
      directory
    } = this.view

    if (directory === null) {
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

    return this.text(name)
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

  serialize() {
    return this.view.serialize()
  }

  deserialize(state) {
    return this.view.deserialize(null, state)
  }

}
