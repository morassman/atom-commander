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
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var FTPSymLink;
var VSymLink = require('../vsymlink');
var PathUtil = require('path').posix;
var FTPFile = require('./ftp-file');
var FTPDirectory = require('./ftp-directory');
module.exports =
    (FTPSymLink = /** @class */ (function (_super) {
        __extends(FTPSymLink, _super);
        function FTPSymLink(fileSystem, path, baseName) {
            if (baseName === void 0) { baseName = null; }
            var _this = this;
            _this.path = path;
            _this.baseName = baseName;
            _this = _super.call(this, fileSystem) || this;
            _this.writable = true;
            if (_this.baseName === null) {
                _this.baseName = PathUtil.basename(_this.path);
            }
            return _this;
        }
        FTPSymLink.prototype.getRealPathSync = function () {
            return this.path;
        };
        FTPSymLink.prototype.getBaseName = function () {
            return this.baseName;
        };
        FTPSymLink.prototype.getParent = function () {
            return this.fileSystem.getDirectory(PathUtil.dirname(this.path));
        };
        FTPSymLink.prototype.isWritable = function () {
            return this.writable;
        };
        FTPSymLink.prototype.createFileItem = function (targetPath) {
            return new FTPFile(this.getFileSystem(), false, targetPath);
        };
        FTPSymLink.prototype.createDirectoryItem = function (targetPath) {
            return new FTPDirectory(this.getFileSystem(), false, targetPath);
        };
        return FTPSymLink;
    }(VSymLink)));
//# sourceMappingURL=ftp-symlink.js.map