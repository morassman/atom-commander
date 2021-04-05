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
 * DS002: Fix invalid constructor
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var BookmarksView;
var Directory = require('atom').Directory;
var SelectListView = require('atom-space-pen-views').SelectListView;
module.exports =
    (BookmarksView = /** @class */ (function (_super) {
        __extends(BookmarksView, _super);
        function BookmarksView(actions, open, fromView) {
            var _this = this;
            _this.actions = actions;
            _this.open = open;
            _this.fromView = fromView;
            _this = _super.call(this) || this;
            return _this;
        }
        BookmarksView.prototype.initialize = function () {
            _super.prototype.initialize.call(this);
            this.addClass('overlay from-top');
            this.refreshItems();
            if (this.panel == null) {
                this.panel = atom.workspace.addModalPanel({ item: this });
            }
            this.panel.show();
            return this.focusFilterEditor();
        };
        BookmarksView.prototype.refreshItems = function () {
            var items = [];
            var bookmarkManager = this.actions.main.getBookmarkManager();
            for (var _i = 0, _a = Array.from(bookmarkManager.bookmarks); _i < _a.length; _i++) {
                var bookmark = _a[_i];
                var item = {};
                item.bookmark = bookmark;
                if (bookmark.name.length === 0) {
                    item.text = bookmark.pathDescription.uri;
                }
                else {
                    item.text = bookmark.name + ": " + bookmark.pathDescription.uri;
                }
                items.push(item);
            }
            return this.setItems(items);
        };
        BookmarksView.prototype.getFilterKey = function () {
            return "text";
        };
        BookmarksView.prototype.viewForItem = function (item) {
            if (item.bookmark.name.length === 0) {
                return "<li>" + item.text + "</li>";
            }
            return "<li class='two-lines'>\n<div class='primary-line'>" + item.bookmark.name + "</div>\n<div class='secondary-line'>" + item.bookmark.pathDescription.uri + "</div>\n</li>";
        };
        // return "<li><span class='badge badge-info'>#{item.bookmark.name}</span> #{item.bookmark.path}</li>";
        BookmarksView.prototype.confirmed = function (item) {
            if (this.open) {
                this.cancel();
                return this.actions.goBookmark(item.bookmark);
            }
            else {
                this.actions.main.getBookmarkManager().removeBookmark(item.bookmark);
                return this.refreshItems();
            }
        };
        BookmarksView.prototype.cancelled = function () {
            this.hide();
            if (this.panel != null) {
                this.panel.destroy();
            }
            if (this.fromView) {
                return this.actions.main.mainView.refocusLastView();
            }
        };
        return BookmarksView;
    }(SelectListView)));
//# sourceMappingURL=bookmarks-view.js.map