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
var RenameDialog;
var InputDialog = require('@aki77/atom-input-dialog');
module.exports =
    (RenameDialog = /** @class */ (function (_super) {
        __extends(RenameDialog, _super);
        // item : Either a File or a Directory.
        function RenameDialog(containerView, item) {
            var _this = this;
            _this.containerView = containerView;
            _this.item = item;
            _this = _super.call(this, { prompt: 'Enter a new name:' }) || this;
            return _this;
        }
        RenameDialog.prototype.initialize = function () {
            var _this = this;
            this.itemName = this.item.getBaseName();
            this.oldPath = this.item.getRealPathSync();
            this.directoryPath = this.item.getParent().getRealPathSync();
            var options = {};
            options.defaultText = this.itemName;
            var pathUtil = this.item.getFileSystem().getPathUtil();
            options.callback = function (text) {
                var name = text.trim();
                var newPath = pathUtil.join(_this.directoryPath, name);
                if (_this.oldPath === newPath) {
                    return;
                }
                _this.item.fileSystem.rename(_this.oldPath, newPath, function (err) {
                    if (err != null) {
                        return atom.notifications.addWarning(err);
                    }
                    else {
                        // TODO : It's not necessary to refresh the whole directory. Just update the item.
                        return _this.containerView.refreshDirectory();
                    }
                });
                return _this.containerView.requestFocus();
            };
            options.validate = function (text) {
                var name = text.trim();
                if (name === this.itemName) {
                    return null;
                }
                if (name.length === 0) {
                    return "The name may not be empty.";
                }
                var parsed = pathUtil.parse(name);
                if (parsed.dir !== "") {
                    return "The name should not contain a parent.";
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
        return RenameDialog;
    }(InputDialog)));
//# sourceMappingURL=rename-dialog.js.map