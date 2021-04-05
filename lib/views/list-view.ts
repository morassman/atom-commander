/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let ListView;
const ListFileView = require('./list-file-view');
const ListDirectoryView = require('./list-directory-view');
const ListSymLinkView = require('./list-symlink-view');
const ContainerView = require('./container-view');
const {$} = require('atom-space-pen-views');

module.exports =
(ListView = class ListView extends ContainerView {

  constructor(left) {
    super(left);
  }

  static container() {
    // @div {class: 'atom-commander-list-view-resizer', click:'requestFocus', outlet: 'listViewResizer'}, =>
    return this.div({class: 'atom-commander-list-view-scroller', outlet:'scroller', click:'requestFocus'}, () => {
      return this.table({class: 'atom-commander-list-view-table', outlet: 'table'}, () => {
        return this.tbody({class: 'atom-commander-list-view list', tabindex: -1, outlet: 'tableBody'});
    });
  });
  }

  initialize(state){
    super.initialize(state);

    return this.tableBody.focusout(() => {
      return this.refreshHighlight();
    });
  }

  clearItemViews() {
    this.tableBody.empty();
    this.tableBody.append($(this.createHeaderView()));

    this.tableBody.find('#name-header').click(() => this.getMain().actions.sortByName());
    this.tableBody.find('#extension-header').click(() => this.getMain().actions.sortByExtension());
    this.tableBody.find('#size-header').click(() => this.getMain().actions.sortBySize());
    this.tableBody.find('#date-header').click(() => this.getMain().actions.sortByDate());

    this.setExtensionColumnVisible(this.isExtensionColumnVisible());
    this.setSizeColumnVisible(this.isSizeColumnVisible());
    return this.setDateColumnVisible(this.isDateColumnVisible());
  }

  createParentView(index, directoryController) {
    const itemView = new ListDirectoryView();
    itemView.initialize(this, index, true, directoryController);
    return itemView;
  }

  createFileView(index, fileController) {
    const itemView = new ListFileView();
    itemView.initialize(this, index, fileController);
    return itemView;
  }

  createDirectoryView(index, directoryController) {
    const itemView = new ListDirectoryView();
    itemView.initialize(this, index, false, directoryController);
    return itemView;
  }

  createSymLinkView(index, symLinkController) {
    const itemView = new ListSymLinkView();
    itemView.initialize(this, index, symLinkController);
    return itemView;
  }

  addItemView(itemView) {
    if (!this.isSizeColumnVisible()) {
      itemView.setSizeColumnVisible(false);
    }

    if (!this.isDateColumnVisible()) {
      itemView.setDateColumnVisible(false);
    }

    itemView.setExtensionColumnVisible(this.isExtensionColumnVisible());

    return this.tableBody[0].appendChild(itemView);
  }

  createHeaderView() {
    return `\
<tr>
  <th id='name-header'><span id='name' class='sort-icon icon'>Name</span></th>
  <th id='extension-header'><span id='extension' class='sort-icon icon'>Extension</span></th>
  <th id='size-header'><span id='size' class='sort-icon icon'>Size</span></th>
  <th id='date-header'><span id='date' class='sort-icon icon'>Date</span></th>
</tr>\
`;
  }

  focus() {
    this.tableBody.focus();
    return super.focus();
  }

  hasContainerFocus() {
    return this.tableBody.is(':focus') || (document.activeElement === this.tableBody[0]);
  }

  pageUp() {
    return this.pageAdjust(true);
  }

  pageDown() {
    return this.pageAdjust(false);
  }

  pageAdjust(up) {
    if ((this.highlightIndex === null) || (this.itemViews.length === 0)) {
      return;
    }

    const itemViewHeight = this.tableBody.height() / this.itemViews.length;

    if (itemViewHeight === 0) {
      return;
    }

    const scrollHeight = this.scroller.scrollBottom() - this.scroller.scrollTop();
    const itemsPerPage = Math.round(scrollHeight / itemViewHeight);

    if (up) {
      return this.highlightIndex(this.highlightedIndex - itemsPerPage);
    } else {
      return this.highlightIndex(this.highlightedIndex + itemsPerPage);
    }
  }

  adjustContentHeight(change) {}
    // @listViewResizer.height(@listViewResizer.outerHeight() + change);

  getContentHeight() {
    return 0;
  }
    // return @listViewResizer.height();

  setContentHeight(contentHeight) {}
    // @listViewResizer.height(contentHeight);

  getScrollTop() {
    return this.scroller.scrollTop();
  }

  setScrollTop(scrollTop) {
    return this.scroller.scrollTop(scrollTop);
  }

  setExtensionColumnVisible(visible) {
    if (visible) {
      this.table.find('tr :nth-child(2)').show();
    } else {
      this.table.find('tr :nth-child(2)').hide();
    }

    return this.refreshItemViews();
  }

  setSizeColumnVisible(visible) {
    if (visible) {
      return this.table.find('tr :nth-child(3)').show();
    } else {
      return this.table.find('tr :nth-child(3)').hide();
    }
  }

  setDateColumnVisible(visible) {
    if (visible) {
      return this.table.find('tr :nth-child(4)').show();
    } else {
      return this.table.find('tr :nth-child(4)').hide();
    }
  }

  refreshSortIcons(sortBy, ascending) {
    const element = this.table.find('#'+sortBy);

    if ((element == null)) {
      return;
    }

    element.removeClass('icon-chevron-up');
    element.removeClass('icon-chevron-down');

    if (ascending) {
      element.addClass('icon-chevron-down');
    } else {
      element.addClass('icon-chevron-up');
    }

    return element.show();
  }
});
