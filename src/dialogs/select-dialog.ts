/*
 * decaffeinate suggestions:
 * DS002: Fix invalid constructor
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let SelectDialog;
const InputDialog = require('@aki77/atom-input-dialog');

module.exports =
(SelectDialog = class SelectDialog extends InputDialog {

  constructor(actions, containerView, add) {
    this.actions = actions;
    this.containerView = containerView;
    this.add = add;
    if (this.add) {
      super({prompt:'Select items that matches pattern:'});
    } else {
      super({prompt:'Deselect items that matches pattern:'});
    }
  }

  initialize() {
    const options = {};
    options.defaultText = "*";

    options.callback = text => {
      const pattern = text.trim();
      const itemViews = this.containerView.getItemViewsWithPattern(pattern);

      return (() => {
        const result = [];
        for (let itemView of Array.from(itemViews)) {
          if (itemView.isSelectable()) {
            result.push(itemView.select(this.add));
          } else {
            result.push(undefined);
          }
        }
        return result;
      })();
    };

    options.validate = function(text) {
      const pattern = text.trim();

      if (pattern.length === 0) {
        return 'The pattern may not be empty.';
      }
    };

    return super.initialize(options);
  }
});
