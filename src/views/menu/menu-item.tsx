import { View } from '../view'

const etch = require('etch')

export class MenuItem extends View {

  title: string

  ids: string[]

  subMenuItems: {[prop: string]: MenuItem}

  constructor(public readonly parent: MenuItem | null, public readonly id: string, public readonly name: string, public readonly callback?: ()=>void) {
    super({}, false)
    this.title = `${this.id} ${this.name}`
    this.ids = []
    this.subMenuItems = {}
    this.initialize()
  }

  onClick() {
    if (this.callback) {
      this.callback()
    }
  }

  render() {
    return <button className='btn btn-primary inline-block' onClick={() => this.onClick()}>{this.title}</button>
  }

  addMenuItem(id: string, name: string, callback?: ()=>void) {
    const subMenuItem = new MenuItem(this, id, name, callback)

    this.ids.push(id)
    this.subMenuItems[id] = subMenuItem

    return subMenuItem
  }

  getMenuItem(id: string): MenuItem | undefined {
    return this.subMenuItems[id]
  }

  getMenuItemWithTitle(title: string): MenuItem | null {
    for (let id of this.ids) {
      const subMenuItem = this.subMenuItems[id]

      if (subMenuItem.title === title) {
        return subMenuItem
      }
    }

    return null
  }

}
