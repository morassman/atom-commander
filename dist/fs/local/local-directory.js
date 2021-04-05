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
var LocalDirectory;
var VDirectory = require('../vdirectory');
var LocalFile = require('./local-file');
var fs = require('fs');
module.exports =
    (LocalDirectory = /** @class */ (function (_super) {
        __extends(LocalDirectory, _super);
        function LocalDirectory(fileSystem, directory) {
            var _this = this;
            var stats;
            _this.directory = directory;
            _this = _super.call(this, fileSystem) || this;
            if (_this.directory.isSymbolicLink()) {
                stats = fs.lstatSync(_this.directory.getRealPathSync());
            }
            else {
                stats = fs.statSync(_this.directory.getRealPathSync());
            }
            _this.modifyDate = stats.mtime;
            _this.size = stats.size;
            return _this;
        }
        LocalDirectory.prototype.existsSync = function () {
            return this.directory.existsSync();
        };
        LocalDirectory.prototype.getRealPathSync = function () {
            return this.directory.getRealPathSync();
        };
        LocalDirectory.prototype.getBaseName = function () {
            return this.directory.getBaseName();
        };
        LocalDirectory.prototype.getParent = function () {
            return new LocalDirectory(this.fileSystem, this.directory.getParent());
        };
        LocalDirectory.prototype.isRoot = function () {
            return this.directory.isRoot();
        };
        LocalDirectory.prototype.isWritable = function () {
            return true;
        };
        LocalDirectory.prototype.isLink = function () {
            return this.directory.isSymbolicLink();
        };
        LocalDirectory.prototype.onDidChange = function (callback) {
            return this.directory.onDidChange(callback);
        };
        return LocalDirectory;
    }(VDirectory)));
//# sourceMappingURL=local-directory.js.map