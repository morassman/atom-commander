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
var FTPDirectory;
var PathUtil = require('path').posix;
var VDirectory = require('../vdirectory');
module.exports =
    (FTPDirectory = /** @class */ (function (_super) {
        __extends(FTPDirectory, _super);
        function FTPDirectory(fileSystem, link, path, baseName) {
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
        FTPDirectory.prototype.existsSync = function () {
            return true;
        };
        FTPDirectory.prototype.getRealPathSync = function () {
            return this.path;
        };
        FTPDirectory.prototype.getBaseName = function () {
            return this.baseName;
        };
        FTPDirectory.prototype.getParent = function () {
            return new FTPDirectory(this.fileSystem, false, PathUtil.dirname(this.path));
        };
        FTPDirectory.prototype.isRoot = function () {
            return PathUtil.dirname(this.path) === this.path;
        };
        FTPDirectory.prototype.isWritable = function () {
            return this.writable;
        };
        FTPDirectory.prototype.isLink = function () {
            return this.link;
        };
        FTPDirectory.prototype.onDidChange = function (callback) {
            return null;
        };
        return FTPDirectory;
    }(VDirectory)));
// return @directory.onDidChange(callback);
//# sourceMappingURL=ftp-directory.js.map