"use strict";
exports.__esModule = true;
exports.VItem = void 0;
var VItem = /** @class */ (function () {
    function VItem(fileSystem) {
        this.fileSystem = fileSystem;
        this.modifyDate = null;
        this.size = null;
    }
    VItem.prototype.setController = function (controller) {
        this.controller = controller;
    };
    VItem.prototype.getController = function () {
        return this.controller;
    };
    VItem.prototype.getFileSystem = function () {
        return this.fileSystem;
    };
    VItem.prototype.getURI = function () {
        return this.fileSystem.getURI(this);
    };
    VItem.prototype.getPath = function () {
        return this.getRealPathSync();
    };
    VItem.prototype["delete"] = function (callback) {
        if (this.isFile()) {
            return this.fileSystem.deleteFile(this.getPath(), callback);
        }
        else if (this.isDirectory()) {
            return this.fileSystem.deleteDirectory(this.getPath(), callback);
        }
    };
    VItem.prototype.getPathDescription = function () {
        return {
            isLink: this.isLink(),
            isFile: this.isFile(),
            path: this.getPath(),
            name: this.getBaseName(),
            isLocal: this.fileSystem.isLocal(),
            fileSystemId: this.fileSystem.getID(),
            uri: this.getURI()
        };
    };
    VItem.prototype.isLocal = function () {
        return this.fileSystem.isLocal();
    };
    VItem.prototype.isRemote = function () {
        return this.fileSystem.isRemote();
    };
    VItem.prototype.getModifyDate = function () {
        return this.modifyDate;
    };
    VItem.prototype.getSize = function () {
        return this.size;
    };
    return VItem;
}());
exports.VItem = VItem;
//# sourceMappingURL=vitem.js.map