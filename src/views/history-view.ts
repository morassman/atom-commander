/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let HistoryView;
const {$, View} = require('atom-space-pen-views');

module.exports =
(HistoryView = class HistoryView extends View {

  constructor() {
    super();
  }

  static content() {
    return this.div({class: "history-panel popover-list select-list"}, () => {
      return this.ol({id: "itemList", class: "history-list list-group", style: "margin: 0", outlet: "itemList"});
  });
  }

  initialize() {
    this.hide();
    this.clickHandler = e => {
      if ((e.target.id !== 'itemList') && !this.itemList.find(e.target).length) {
        return this.close();
      }
    };

    this.on('mousedown', '.list-item', e => {
      this.hide();
      return this.containerView.setDirectory(e.target.textContent);
    });

    return this.itemList.append($("<li class='history-list-item list-item'>/Users/henkmarais/github</li>"));
  }

  toggle() {
    if (this.isVisible()) {
      return this.close();
    } else {
      return this.open();
    }
  }

  isVisible() {
    return this.is(":visible");
  }

  open() {
    // @itemList.empty();
    this.show();
    this.itemList.focus();
    return $(document).on('click', this.clickHandler);
  }

  close() {
    this.hide();
    return $(document).off('click', this.clickHandler);
  }

  setContainerView(containerView) {
    this.containerView = containerView;
    if (this.containerView.isLeft()) {
      return this.addClass("left-history-panel");
    } else {
      return this.addClass("right-history-panel");
    }
  }

  refreshItems() {}
});
