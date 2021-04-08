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
exports.VDirectory = void 0;
var _1 = require("./");
var VDirectory = /** @class */ (function (_super) {
    __extends(VDirectory, _super);
    function VDirectory(fileSystem) {
        return _super.call(this, fileSystem) || this;
    }
    VDirectory.prototype.isFile = function () {
        return false;
    };
    VDirectory.prototype.isDirectory = function () {
        return true;
    };
    // The callback received three parameters :
    // 1.) This directory.
    // 2.) err. null if no error.
    // 3.) The list of entries containing VFile and VDirectory instances.
    VDirectory.prototype.getEntries = function (callback) {
        return this.fileSystem.getEntries(this, callback);
    };
    VDirectory.prototype.getFile = function (name) {
        var pathUtil = this.fileSystem.getPathUtil();
        return this.fileSystem.getFile(pathUtil.join(this.getPath(), name));
    };
    // The callback receives one parameter :
    // 1.) file : The file that was created. null if it could not be created.
    VDirectory.prototype.newFile = function (name, callback) {
        var pathUtil = this.fileSystem.getPathUtil();
        this.fileSystem.newFile(pathUtil.join(this.getPath(), name), callback);
    };
    return VDirectory;
}(_1.VItem));
exports.VDirectory = VDirectory;
//# sourceMappingURL=vdirectory.js.map