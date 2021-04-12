/*
 * decaffeinate suggestions:
 * DS002: Fix invalid constructor
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let AddBookmarkDialog;
const fs = require('fs-plus');
const InputDialog = require('@aki77/atom-input-dialog');

module.exports =
(AddBookmarkDialog = class AddBookmarkDialog extends InputDialog {

  constructor(main, name, item, fromView) {
    this.main = main;
    this.name = name;
    this.item = item;
    this.fromView = fromView;
    super({prompt:`Enter a name for the bookmark (may be empty): ${this.item.getPath()}`});
  }

  initialize() {
    const options = {};
    options.defaultText = this.name;

    options.callback = text => {
      this.main.getBookmarkManager().addBookmark(text.trim(), this.item);

      if (this.fromView) {
        return this.main.mainView.refocusLastView();
      }
    };

    options.validate = text => null;

    return super.initialize(options);
  }
});
