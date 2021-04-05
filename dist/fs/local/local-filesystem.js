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
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var LocalFileSystem;
var fsp = require('fs-plus');
var fse = require('fs-extra');
var VFileSystem = require('../vfilesystem');
var LocalFile = require('./local-file');
var LocalDirectory = require('./local-directory');
var _a = require('atom'), Directory = _a.Directory, File = _a.File;
var PathUtil = require('path');
module.exports =
    (LocalFileSystem = /** @class */ (function (_super) {
        __extends(LocalFileSystem, _super);
        function LocalFileSystem(main) {
            return _super.call(this, main) || this;
        }
        LocalFileSystem.prototype.clone = function () {
            return new LocalFileSystem(this.getMain());
        };
        LocalFileSystem.prototype.isLocal = function () {
            return true;
        };
        LocalFileSystem.prototype.connectImpl = function () {
            return this.setConnected(true);
        };
        LocalFileSystem.prototype.getSafeConfig = function () {
            return {};
        };
        LocalFileSystem.prototype.getFile = function (path) {
            return new LocalFile(this, new File(path));
        };
        LocalFileSystem.prototype.getDirectory = function (path) {
            return new LocalDirectory(this, new Directory(path));
        };
        LocalFileSystem.prototype.getItemWithPathDescription = function (pathDescription) {
            if (pathDescription.isFile) {
                return this.getFile(pathDescription.path);
            }
            return this.getDirectory(pathDescription.path);
        };
        LocalFileSystem.prototype.getURI = function (item) {
            return item.getRealPathSync();
        };
        LocalFileSystem.prototype.getName = function () {
            return "local";
        };
        LocalFileSystem.prototype.getID = function () {
            return "local";
        };
        LocalFileSystem.prototype.getUsername = function () {
            return "";
        };
        LocalFileSystem.prototype.getPathUtil = function () {
            return PathUtil;
        };
        LocalFileSystem.prototype.renameImpl = function (oldPath, newPath, callback) {
            fsp.moveSync(oldPath, newPath);
            if (callback !== null) {
                return callback(null);
            }
        };
        LocalFileSystem.prototype.makeDirectoryImpl = function (path, callback) {
            var directory = new Directory(path);
            return directory.create().then(function (created) {
                if ((callback == null)) {
                    return;
                }
                if (created) {
                    return callback(null);
                }
                else {
                    return callback("Error creating folder.");
                }
            });
        };
        LocalFileSystem.prototype.deleteFileImpl = function (path, callback) {
            fse.removeSync(path);
            if (callback != null) {
                return callback(null);
            }
        };
        LocalFileSystem.prototype.deleteDirectoryImpl = function (path, callback) {
            fse.removeSync(path);
            if (callback != null) {
                return callback(null);
            }
        };
        LocalFileSystem.prototype.downloadImpl = function (path, localPath, callback) {
            return fse.copy(path, localPath, callback);
        };
        LocalFileSystem.prototype.upload = function (localPath, path, callback) {
            return fse.copy(localPath, path, callback);
        };
        LocalFileSystem.prototype.openFile = function (file) {
            atom.workspace.open(file.getRealPathSync());
            return this.fileOpened(file);
        };
        LocalFileSystem.prototype.createReadStreamImpl = function (path, callback) {
            return callback(null, fse.createReadStream(path));
        };
        LocalFileSystem.prototype.newFileImpl = function (path, callback) {
            var _this = this;
            var file = new File(path);
            var p = file.create().then(function (created) {
                if (created) {
                    return callback(_this.getFile(path), null);
                }
                else {
                    return callback(null, 'File could not be created.');
                }
            });
            return p["catch"](function (error) {
                return callback(null, error);
            });
        };
        LocalFileSystem.prototype.getEntriesImpl = function (directory, callback) {
            var _this = this;
            return directory.directory.getEntries(function (err, entries) {
                if (err != null) {
                    return callback(directory, err, []);
                }
                else {
                    return callback(directory, null, _this.wrapEntries(entries));
                }
            });
        };
        LocalFileSystem.prototype.wrapEntries = function (entries) {
            var result = [];
            for (var _i = 0, _a = Array.from(entries); _i < _a.length; _i++) {
                var entry = _a[_i];
                // Added a try/catch, because it was found that there are sometimes
                // temporary files created by the OS in the list of entries that no
                // exist by the time they get here. Reading them then threw an error.
                try {
                    if (entry.isDirectory()) {
                        result.push(new LocalDirectory(this, entry));
                    }
                    else {
                        result.push(new LocalFile(this, entry));
                    }
                }
                catch (error) {
                    console.error(error);
                }
            }
            return result;
        };
        return LocalFileSystem;
    }(VFileSystem)));
//# sourceMappingURL=local-filesystem.js.map