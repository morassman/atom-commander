export class MenuItem {

  title: string

  ids: string[]

  subMenuItems: any

  constructor(public readonly parent: any, public readonly id: string, public readonly name: string, public readonly callback:any=null) {
    this.parent = parent
    this.id = id
    this.name = name
    this.callback = callback
    this.title = `${this.id} ${this.name}`
    this.ids = []
    this.subMenuItems = {}
  }

  addMenuItem(id: string, name: string, callback: any=null) {
    const subMenuItem = new MenuItem(this, id, name, callback)

    this.ids.push(id)
    this.subMenuItems[id] = subMenuItem

    return subMenuItem
  }

  getMenuItem(id: string): any | undefined {
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
