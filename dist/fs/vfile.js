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
exports.VFile = void 0;
var _1 = require(".");
var VFile = /** @class */ (function (_super) {
    __extends(VFile, _super);
    function VFile(fileSystem) {
        return _super.call(this, fileSystem) || this;
    }
    VFile.prototype.isFile = function () {
        return true;
    };
    VFile.prototype.isDirectory = function () {
        return false;
    };
    VFile.prototype.download = function (localPath, callback) {
        var taskManager = this.getFileSystem().getTaskManager();
        if (taskManager) {
            taskManager.getFileSystem().download(this.getPath(), localPath, callback);
        }
    };
    // TODO: callback type
    VFile.prototype.upload = function (localPath, callback) {
        var taskManager = this.getFileSystem().getTaskManager();
        if (taskManager) {
            taskManager.getFileSystem().upload(localPath, this.getPath(), callback);
        }
    };
    VFile.prototype.open = function () {
        return this.fileSystem.openFile(this);
    };
    // Callback receives two arguments:
    // 1.) err : String with error message. null if no error.
    // 2.) stream : A ReadableStream.
    VFile.prototype.createReadStream = function (callback) {
        this.fileSystem.createReadStream(this.getPath(), callback);
    };
    return VFile;
}(_1.VItem));
exports.VFile = VFile;
//# sourceMappingURL=vfile.js.map