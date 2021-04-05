/*
 * decaffeinate suggestions:
 * DS002: Fix invalid constructor
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let BookmarksView;
const {Directory} = require('atom');
const {SelectListView} = require('atom-space-pen-views');

module.exports =
(BookmarksView = class BookmarksView extends SelectListView {

  constructor(actions, open, fromView) {
    this.actions = actions;
    this.open = open;
    this.fromView = fromView;
    super();
  }

  initialize() {
    super.initialize();

    this.addClass('overlay from-top');
    this.refreshItems();

    if (this.panel == null) { this.panel = atom.workspace.addModalPanel({item: this}); }
    this.panel.show();
    return this.focusFilterEditor();
  }

  refreshItems() {
    const items = [];

    const bookmarkManager = this.actions.main.getBookmarkManager();

    for (let bookmark of Array.from(bookmarkManager.bookmarks)) {
      const item = {};
      item.bookmark = bookmark;

      if (bookmark.name.length === 0) {
        item.text = bookmark.pathDescription.uri;
      } else {
        item.text = bookmark.name+": "+bookmark.pathDescription.uri;
      }

      items.push(item);
    }

    return this.setItems(items);
  }

  getFilterKey() {
    return "text";
  }

  viewForItem(item) {
    if (item.bookmark.name.length === 0) {
      return `<li>${item.text}</li>`;
    }

    return `\
<li class='two-lines'>
<div class='primary-line'>${item.bookmark.name}</div>
<div class='secondary-line'>${item.bookmark.pathDescription.uri}</div>
</li>`;
  }

    // return "<li><span class='badge badge-info'>#{item.bookmark.name}</span> #{item.bookmark.path}</li>";

  confirmed(item) {
    if (this.open) {
      this.cancel();
      return this.actions.goBookmark(item.bookmark);
    } else {
      this.actions.main.getBookmarkManager().removeBookmark(item.bookmark);
      return this.refreshItems();
    }
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
