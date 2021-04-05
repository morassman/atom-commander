/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var VItem;
module.exports =
    (VItem = /** @class */ (function () {
        function VItem(fileSystem) {
            this.fileSystem = fileSystem;
            this.controller = null;
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
            var result = {};
            result.isLink = this.isLink();
            result.isFile = this.isFile();
            result.path = this.getPath();
            result.name = this.getBaseName();
            result.isLocal = this.fileSystem.isLocal();
            result.fileSystemId = this.fileSystem.getID();
            result.uri = this.getURI();
            return result;
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
        VItem.prototype.isFile = function () { };
        VItem.prototype.isDirectory = function () { };
        VItem.prototype.isLink = function () { };
        VItem.prototype.isWritable = function () { };
        VItem.prototype.existsSync = function () { };
        VItem.prototype.getRealPathSync = function () { };
        VItem.prototype.getBaseName = function () { };
        VItem.prototype.getParent = function () { };
        return VItem;
    }()));
//# sourceMappingURL=vitem.js.map