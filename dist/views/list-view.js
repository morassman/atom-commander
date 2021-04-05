var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var ListView;
var ListFileView = require('./list-file-view');
var ListDirectoryView = require('./list-directory-view');
var ListSymLinkView = require('./list-symlink-view');
var ContainerView = require('./container-view');
var $ = require('atom-space-pen-views').$;
module.exports =
    (ListView = /** @class */ (function (_super) {
        __extends(ListView, _super);
        function ListView(left) {
            return _super.call(this, left) || this;
        }
        ListView.container = function () {
            var _this = this;
            // @div {class: 'atom-commander-list-view-resizer', click:'requestFocus', outlet: 'listViewResizer'}, =>
            return this.div({ "class": 'atom-commander-list-view-scroller', outlet: 'scroller', click: 'requestFocus' }, function () {
                return _this.table({ "class": 'atom-commander-list-view-table', outlet: 'table' }, function () {
                    return _this.tbody({ "class": 'atom-commander-list-view list', tabindex: -1, outlet: 'tableBody' });
                });
            });
        };
        ListView.prototype.initialize = function (state) {
            var _this = this;
            _super.prototype.initialize.call(this, state);
            return this.tableBody.focusout(function () {
                return _this.refreshHighlight();
            });
        };
        ListView.prototype.clearItemViews = function () {
            var _this = this;
            this.tableBody.empty();
            this.tableBody.append($(this.createHeaderView()));
            this.tableBody.find('#name-header').click(function () { return _this.getMain().actions.sortByName(); });
            this.tableBody.find('#extension-header').click(function () { return _this.getMain().actions.sortByExtension(); });
            this.tableBody.find('#size-header').click(function () { return _this.getMain().actions.sortBySize(); });
            this.tableBody.find('#date-header').click(function () { return _this.getMain().actions.sortByDate(); });
            this.setExtensionColumnVisible(this.isExtensionColumnVisible());
            this.setSizeColumnVisible(this.isSizeColumnVisible());
            return this.setDateColumnVisible(this.isDateColumnVisible());
        };
        ListView.prototype.createParentView = function (index, directoryController) {
            var itemView = new ListDirectoryView();
            itemView.initialize(this, index, true, directoryController);
            return itemView;
        };
        ListView.prototype.createFileView = function (index, fileController) {
            var itemView = new ListFileView();
            itemView.initialize(this, index, fileController);
            return itemView;
        };
        ListView.prototype.createDirectoryView = function (index, directoryController) {
            var itemView = new ListDirectoryView();
            itemView.initialize(this, index, false, directoryController);
            return itemView;
        };
        ListView.prototype.createSymLinkView = function (index, symLinkController) {
            var itemView = new ListSymLinkView();
            itemView.initialize(this, index, symLinkController);
            return itemView;
        };
        ListView.prototype.addItemView = function (itemView) {
            if (!this.isSizeColumnVisible()) {
                itemView.setSizeColumnVisible(false);
            }
            if (!this.isDateColumnVisible()) {
                itemView.setDateColumnVisible(false);
            }
            itemView.setExtensionColumnVisible(this.isExtensionColumnVisible());
            return this.tableBody[0].appendChild(itemView);
        };
        ListView.prototype.createHeaderView = function () {
            return "<tr>\n  <th id='name-header'><span id='name' class='sort-icon icon'>Name</span></th>\n  <th id='extension-header'><span id='extension' class='sort-icon icon'>Extension</span></th>\n  <th id='size-header'><span id='size' class='sort-icon icon'>Size</span></th>\n  <th id='date-header'><span id='date' class='sort-icon icon'>Date</span></th>\n</tr>";
        };
        ListView.prototype.focus = function () {
            this.tableBody.focus();
            return _super.prototype.focus.call(this);
        };
        ListView.prototype.hasContainerFocus = function () {
            return this.tableBody.is(':focus') || (document.activeElement === this.tableBody[0]);
        };
        ListView.prototype.pageUp = function () {
            return this.pageAdjust(true);
        };
        ListView.prototype.pageDown = function () {
            return this.pageAdjust(false);
        };
        ListView.prototype.pageAdjust = function (up) {
            if ((this.highlightIndex === null) || (this.itemViews.length === 0)) {
                return;
            }
            var itemViewHeight = this.tableBody.height() / this.itemViews.length;
            if (itemViewHeight === 0) {
                return;
            }
            var scrollHeight = this.scroller.scrollBottom() - this.scroller.scrollTop();
            var itemsPerPage = Math.round(scrollHeight / itemViewHeight);
            if (up) {
                return this.highlightIndex(this.highlightedIndex - itemsPerPage);
            }
            else {
                return this.highlightIndex(this.highlightedIndex + itemsPerPage);
            }
        };
        ListView.prototype.adjustContentHeight = function (change) { };
        // @listViewResizer.height(@listViewResizer.outerHeight() + change);
        ListView.prototype.getContentHeight = function () {
            return 0;
        };
        // return @listViewResizer.height();
        ListView.prototype.setContentHeight = function (contentHeight) { };
        // @listViewResizer.height(contentHeight);
        ListView.prototype.getScrollTop = function () {
            return this.scroller.scrollTop();
        };
        ListView.prototype.setScrollTop = function (scrollTop) {
            return this.scroller.scrollTop(scrollTop);
        };
        ListView.prototype.setExtensionColumnVisible = function (visible) {
            if (visible) {
                this.table.find('tr :nth-child(2)').show();
            }
            else {
                this.table.find('tr :nth-child(2)').hide();
            }
            return this.refreshItemViews();
        };
        ListView.prototype.setSizeColumnVisible = function (visible) {
            if (visible) {
                return this.table.find('tr :nth-child(3)').show();
            }
            else {
                return this.table.find('tr :nth-child(3)').hide();
            }
        };
        ListView.prototype.setDateColumnVisible = function (visible) {
            if (visible) {
                return this.table.find('tr :nth-child(4)').show();
            }
            else {
                return this.table.find('tr :nth-child(4)').hide();
            }
        };
        ListView.prototype.refreshSortIcons = function (sortBy, ascending) {
            var element = this.table.find('#' + sortBy);
            if ((element == null)) {
                return;
            }
            element.removeClass('icon-chevron-up');
            element.removeClass('icon-chevron-down');
            if (ascending) {
                element.addClass('icon-chevron-down');
            }
            else {
                element.addClass('icon-chevron-up');
            }
            return element.show();
        };
        return ListView;
    }(ContainerView)));
//# sourceMappingURL=list-view.js.map