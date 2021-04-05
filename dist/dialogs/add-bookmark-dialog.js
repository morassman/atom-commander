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
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var AddBookmarkDialog;
var fs = require('fs-plus');
var InputDialog = require('@aki77/atom-input-dialog');
module.exports =
    (AddBookmarkDialog = /** @class */ (function (_super) {
        __extends(AddBookmarkDialog, _super);
        function AddBookmarkDialog(main, name, item, fromView) {
            var _this = this;
            _this.main = main;
            _this.name = name;
            _this.item = item;
            _this.fromView = fromView;
            _this = _super.call(this, { prompt: "Enter a name for the bookmark (may be empty): " + _this.item.getPath() }) || this;
            return _this;
        }
        AddBookmarkDialog.prototype.initialize = function () {
            var _this = this;
            var options = {};
            options.defaultText = this.name;
            options.callback = function (text) {
                _this.main.getBookmarkManager().addBookmark(text.trim(), _this.item);
                if (_this.fromView) {
                    return _this.main.mainView.refocusLastView();
                }
            };
            options.validate = function (text) { return null; };
            return _super.prototype.initialize.call(this, options);
        };
        return AddBookmarkDialog;
    }(InputDialog)));
//# sourceMappingURL=add-bookmark-dialog.js.map