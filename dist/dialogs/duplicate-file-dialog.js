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
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var DuplicateFileDialog;
var Utils = require('../utils');
var fse = require('fs-extra');
var InputDialog = require('@aki77/atom-input-dialog');
module.exports =
    (DuplicateFileDialog = /** @class */ (function (_super) {
        __extends(DuplicateFileDialog, _super);
        function DuplicateFileDialog(containerView, item) {
            var _this = this;
            _this.containerView = containerView;
            _this.item = item;
            _this = _super.call(this, { prompt: 'Enter a name for the duplicate:' }) || this;
            return _this;
        }
        DuplicateFileDialog.prototype.initialize = function () {
            var _this = this;
            this.directory = this.item.getParent();
            var options = {};
            options.defaultText = this.item.getBaseName();
            options.callback = function (text) {
                var name = text.trim();
                var pathUtil = _this.directory.getFileSystem().getPathUtil();
                var newPath = pathUtil.join(_this.directory.getPath(), name);
                return fse.copy(_this.item.getPath(), newPath, function (err) {
                    if (err != null) {
                        return Utils.showWarning("Error duplicating " + this.item.getPath() + ".", err.message, true);
                    }
                });
            };
            options.validate = function (text) {
                var name = text.trim();
                if (name.length === 0) {
                    return 'The name may not be empty.';
                }
                var existingItemView = this.containerView.getItemViewWithName(name);
                if (existingItemView === null) {
                    return null;
                }
                var existingItem = existingItemView.getItem();
                if (existingItem.isFile()) {
                    return "A file with this name already exists.";
                }
                else if (existingItem.isDirectory()) {
                    return "A folder with this name already exists.";
                }
                return null;
            };
            return _super.prototype.initialize.call(this, options);
        };
        return DuplicateFileDialog;
    }(InputDialog)));
//# sourceMappingURL=duplicate-file-dialog.js.map