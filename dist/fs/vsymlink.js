"use strict";
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
exports.__esModule = true;
exports.VSymLink = void 0;
var vitem_1 = require("./vitem");
var VSymLink = /** @class */ (function (_super) {
    __extends(VSymLink, _super);
    function VSymLink(fileSystem) {
        return _super.call(this, fileSystem) || this;
    }
    VSymLink.prototype.setTargetItem = function (targetItem) {
        this.targetItem = targetItem;
        if (this.controller) {
            this.controller.refresh();
        }
    };
    VSymLink.prototype.getTargetItem = function () {
        return this.targetItem;
    };
    VSymLink.prototype.isFile = function () {
        return this.targetItem ? this.targetItem.isFile() : false;
    };
    VSymLink.prototype.isDirectory = function () {
        return this.targetItem ? this.targetItem.isDirectory() : false;
    };
    VSymLink.prototype.existsSync = function () {
        return true;
    };
    VSymLink.prototype.isLink = function () {
        return true;
    };
    VSymLink.prototype.setModifyDate = function (modifyDate) {
        this.modifyDate = modifyDate;
        if (this.controller) {
            this.controller.refresh();
        }
    };
    VSymLink.prototype.setSize = function (size) {
        this.size = size;
        if (this.controller) {
            this.controller.refresh();
        }
    };
    // This is called once it is known that the symlink points to file.
    VSymLink.prototype.setTargetFilePath = function (targetPath) {
        this.setTargetItem(this.createFileItem(targetPath));
    };
    // This is called once it is known that the symlink points to directory.
    VSymLink.prototype.setTargetDirectoryPath = function (targetPath) {
        return this.setTargetItem(this.createDirectoryItem(targetPath));
    };
    return VSymLink;
}(vitem_1.VItem));
exports.VSymLink = VSymLink;
//# sourceMappingURL=vsymlink.js.map