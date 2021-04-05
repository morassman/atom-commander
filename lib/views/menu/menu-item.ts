/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let MenuItem;
module.exports =
(MenuItem = class MenuItem {

  constructor(parent, id, name, callback=null) {
    this.parent = parent;
    this.id = id;
    this.name = name;
    this.callback = callback;
    this.title = `${this.id} ${this.name}`;
    this.ids = [];
    this.subMenuItems = {};
  }

  addMenuItem(id, name, callback=null) {
    const subMenuItem = new MenuItem(this, id, name, callback);

    this.ids.push(id);
    this.subMenuItems[id] = subMenuItem;

    return subMenuItem;
  }

  getMenuItem(id) {
    return this.subMenuItems[id];
  }

  getMenuItemWithTitle(title) {
    for (let id of Array.from(this.ids)) {
      const subMenuItem = this.subMenuItems[id];

      if (subMenuItem.title === title) {
        return subMenuItem;
      }
    }

    return null;
  }
});
