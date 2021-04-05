/*
 * decaffeinate suggestions:
 * DS002: Fix invalid constructor
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let DriveListView;
const drivelist = require('drivelist');
const {Directory} = require('atom');
const {SelectListView} = require('atom-space-pen-views');

module.exports =
(DriveListView = class DriveListView extends SelectListView {

  constructor(actions, fromView) {
    this.actions = actions;
    this.fromView = fromView;
    super();
  }

  initialize() {
    super.initialize();

    if (process.platform === "darwin") {
      this.refreshDarwinItems();
    } else {
      drivelist.list((error, disks) => {
        if (!error) {
          return this.refreshItems(disks);
        }
      });
    }

    this.addClass('overlay from-top');
    if (this.panel == null) { this.panel = atom.workspace.addModalPanel({item: this}); }
    this.panel.show();
    return this.focusFilterEditor();
  }

  refreshDarwinItems() {
    const items = [];
    const directory = new Directory("/Volumes");

    for (let entry of Array.from(directory.getEntriesSync())) {
      if (entry.isDirectory()) {
        items.push(this.createDarwinItem(entry.getBaseName()));
      }
    }

    return this.setItems(items);
  }

  refreshItems(disks){
    const items = [];
    let createItem = this.createLinuxItem;

    if (process.platform === "win32") {
      createItem = this.createWindowsItem;
    }

    for (let disk of Array.from(disks)) {
      const item = createItem(disk);

      if (item !== null) {
        items.push(item);
      }
    }

    return this.setItems(items);
  }

  createDarwinItem(volume) {
    const item = {};

    item.path = "/Volumes/"+volume;
    item.primary = volume;
    item.secondary = item.path;
    item.text = volume;

    return item;
  }

  createLinuxItem(disk) {
    if ((disk.mountpoint == null)) {
      return null;
    }

    const item = {};

    item.path = disk.mountpoint;
    item.primary = disk.mountpoint;
    item.secondary = disk.description;
    item.text = item.primary+" "+item.secondary;

    return item;
  }

  createWindowsItem(disk) {
    const item = {};

    item.path = disk.mountpoint+"\\";
    item.primary = disk.mountpoint;
    item.secondary = disk.description;
    item.text = item.primary+" "+item.secondary;

    return item;
  }

  getFilterKey() {
    return "text";
  }

  viewForItem(item) {
    return `\
<li class='two-lines'>
<div class='primary-line'>${item.primary}</div>
<div class='secondary-line'>${item.secondary}</div>
</li>`;
  }

  confirmed(item) {
    this.actions.goDirectory(new Directory(item.path));
    return this.cancel();
  }

  cancelled() {
    this.hide();
    if (this.panel != null) {
      this.panel.destroy();
    }

    if (this.fromView) {
      return this.actions.main.mainView.refocusLastView();
    }
  }
});
