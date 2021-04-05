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
var VSymLink;
var VItem = require('./vitem');
module.exports =
    (VSymLink = /** @class */ (function (_super) {
        __extends(VSymLink, _super);
        function VSymLink(fileSystem) {
            var _this = _super.call(this, fileSystem) || this;
            _this.targetItem = null;
            return _this;
        }
        VSymLink.prototype.setTargetItem = function (targetItem) {
            this.targetItem = targetItem;
            if (this.controller != null) {
                return this.controller.refresh();
            }
        };
        VSymLink.prototype.getTargetItem = function () {
            return this.targetItem;
        };
        VSymLink.prototype.isFile = function () {
            if ((this.targetItem == null)) {
                return false;
            }
            return this.targetItem.isFile();
        };
        VSymLink.prototype.isDirectory = function () {
            if ((this.targetItem == null)) {
                return false;
            }
            return this.targetItem.isDirectory();
        };
        VSymLink.prototype.existsSync = function () {
            return true;
        };
        VSymLink.prototype.isLink = function () {
            return true;
        };
        VSymLink.prototype.setModifyDate = function (modifyDate) {
            this.modifyDate = modifyDate;
            return (this.controller != null ? this.controller.refresh() : undefined);
        };
        VSymLink.prototype.setSize = function (size) {
            this.size = size;
            return (this.controller != null ? this.controller.refresh() : undefined);
        };
        // This is called once it is known that the symlink points to file.
        VSymLink.prototype.setTargetFilePath = function (targetPath) {
            return this.setTargetItem(this.createFileItem(targetPath));
        };
        // This is called once it is known that the symlink points to directory.
        VSymLink.prototype.setTargetDirectoryPath = function (targetPath) {
            return this.setTargetItem(this.createDirectoryItem(targetPath));
        };
        // Overwrite to create a VFile for the file pointed to by this symlink.
        VSymLink.prototype.createFileItem = function (targetPath) { };
        // Overwrite to create a VDirectory for the directory pointed to by this symlink.
        VSymLink.prototype.createDirectoryItem = function (targetPath) { };
        return VSymLink;
    }(VItem)));
//# sourceMappingURL=vsymlink.js.map