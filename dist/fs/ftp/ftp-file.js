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
var FTPFile;
var PathUtil = require('path').posix;
var VFile = require('../vfile');
module.exports =
    (FTPFile = /** @class */ (function (_super) {
        __extends(FTPFile, _super);
        function FTPFile(fileSystem, link, path, baseName) {
            if (baseName === void 0) { baseName = null; }
            var _this = this;
            _this.link = link;
            _this.path = path;
            _this.baseName = baseName;
            _this = _super.call(this, fileSystem) || this;
            _this.writable = true;
            if (_this.baseName === null) {
                _this.baseName = PathUtil.basename(_this.path);
            }
            return _this;
        }
        FTPFile.prototype.isFile = function () {
            return true;
        };
        FTPFile.prototype.isDirectory = function () {
            return false;
        };
        FTPFile.prototype.existsSync = function () {
            return true;
        };
        FTPFile.prototype.getRealPathSync = function () {
            return this.path;
        };
        FTPFile.prototype.getBaseName = function () {
            return this.baseName;
        };
        FTPFile.prototype.getParent = function () {
            return this.fileSystem.getDirectory(PathUtil.dirname(this.path));
        };
        FTPFile.prototype.isWritable = function () {
            return this.writable;
        };
        FTPFile.prototype.isLink = function () {
            return this.link;
        };
        return FTPFile;
    }(VFile)));
//# sourceMappingURL=ftp-file.js.map