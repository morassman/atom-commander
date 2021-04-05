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
var LocalFile;
var VFile = require('../vfile');
var fs = require('fs');
module.exports =
    (LocalFile = /** @class */ (function (_super) {
        __extends(LocalFile, _super);
        function LocalFile(fileSystem, file) {
            var _this = this;
            var stats;
            _this.file = file;
            _this = _super.call(this, fileSystem) || this;
            if (_this.file.isSymbolicLink()) {
                stats = fs.lstatSync(_this.file.getRealPathSync());
            }
            else {
                stats = fs.statSync(_this.file.getRealPathSync());
            }
            _this.modifyDate = stats.mtime;
            _this.size = stats.size;
            return _this;
        }
        LocalFile.prototype.existsSync = function () {
            return this.file.existsSync();
        };
        LocalFile.prototype.getRealPathSync = function () {
            return this.file.getRealPathSync();
        };
        LocalFile.prototype.getBaseName = function () {
            return this.file.getBaseName();
        };
        LocalFile.prototype.getParent = function () {
            return this.fileSystem.getDirectory(this.file.getParent().getRealPathSync());
        };
        LocalFile.prototype.isWritable = function () {
            return true;
        };
        LocalFile.prototype.isLink = function () {
            return this.file.isSymbolicLink();
        };
        return LocalFile;
    }(VFile)));
//# sourceMappingURL=local-file.js.map