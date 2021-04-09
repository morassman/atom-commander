/*
 * decaffeinate suggestions:
 * DS002: Fix invalid constructor
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let ProjectListView;
const drivelist = require('drivelist');
const {Directory} = require('atom');
const {SelectListView} = require('atom-space-pen-views');

module.exports =
(ProjectListView = class ProjectListView extends SelectListView {

  constructor(actions, fromView) {
    this.actions = actions;
    this.fromView = fromView;
    super();
  }

  initialize() {
    super.initialize();

    this.refreshItems();
    this.addClass('overlay from-top');
    if (this.panel == null) { this.panel = atom.workspace.addModalPanel({item: this}); }
    this.panel.show();
    return this.focusFilterEditor();
  }

  refreshItems() {
    const items = [];
    const projects = atom.project.getDirectories();

    for (let project of Array.from(projects)) {
      items.push(this.createItem(project));
    }

    return this.setItems(items);
  }

  createItem(project) {
    const item = {};

    item.project = project;
    item.primary = project.getBaseName();
    item.secondary = project.getPath();

    return item;
  }

  getFilterKey() {
    return "secondary";
  }

  viewForItem(item) {
    return `\
<li class='two-lines'>
<div class='primary-line'>${item.primary}</div>
<div class='secondary-line'>${item.secondary}</div>
</li>`;
  }

  confirmed(item) {
    this.actions.goDirectory(item.project);
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
