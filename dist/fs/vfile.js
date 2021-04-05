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
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var VFile;
var VItem = require('./vitem');
module.exports =
    (VFile = /** @class */ (function (_super) {
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
            return taskManager.getFileSystem().download(this.getPath(), localPath, callback);
        };
        VFile.prototype.upload = function (localPath, callback) {
            var taskManager = this.getFileSystem().getTaskManager();
            return taskManager.getFileSystem().upload(localPath, this.getPath(), callback);
        };
        VFile.prototype.open = function () {
            return this.fileSystem.openFile(this);
        };
        // Callback receives two arguments:
        // 1.) err : String with error message. null if no error.
        // 2.) stream : A ReadableStream.
        VFile.prototype.createReadStream = function (callback) {
            return this.fileSystem.createReadStream(this.getPath(), callback);
        };
        return VFile;
    }(VItem)));
//# sourceMappingURL=vfile.js.map