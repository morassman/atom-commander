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
exports.LocalFile = void 0;
var fs = require('fs');
var __1 = require("../");
var LocalFile = /** @class */ (function (_super) {
    __extends(LocalFile, _super);
    function LocalFile(fileSystem, file) {
        var _this = _super.call(this, fileSystem) || this;
        _this.file = file;
        _this.file = file;
        var stats;
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
    LocalFile.prototype.getFileSystem = function () {
        return _super.prototype.getFileSystem.call(this);
    };
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
        return this.getFileSystem().getDirectory(this.file.getParent().getRealPathSync());
    };
    LocalFile.prototype.isWritable = function () {
        return true;
    };
    LocalFile.prototype.isLink = function () {
        return this.file.isSymbolicLink();
    };
    return LocalFile;
}(__1.VFile));
exports.LocalFile = LocalFile;
//# sourceMappingURL=local-file.js.map