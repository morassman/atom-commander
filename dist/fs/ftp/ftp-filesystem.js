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
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var FTPFileSystem;
var fs = require('fs');
var FTPClient = require('ftp');
var PathUtil = require('path').posix;
var VFileSystem = require('../vfilesystem');
var FTPFile = require('./ftp-file');
var FTPDirectory = require('./ftp-directory');
var Utils = require('../../utils');
module.exports =
    (FTPFileSystem = /** @class */ (function (_super) {
        __extends(FTPFileSystem, _super);
        function FTPFileSystem(server, config) {
            var _this = this;
            _this.server = server;
            _this.config = config;
            _this = _super.call(this, _this.server.getMain()) || this;
            _this.client = null;
            if ((_this.config.password != null) && (_this.config.passwordDecrypted == null)) {
                _this.config.password = Utils.decrypt(_this.config.password, _this.getDescription());
                _this.config.passwordDecrypted = true;
            }
            _this.clientConfig = _this.getClientConfig();
            return _this;
        }
        FTPFileSystem.prototype.clone = function () {
            var cloneFS = new FTPFileSystem(this.server, this.config);
            cloneFS.clientConfig = this.clientConfig;
            return cloneFS;
        };
        FTPFileSystem.prototype.isLocal = function () {
            return false;
        };
        FTPFileSystem.prototype.connectImpl = function () {
            var _this = this;
            if ((this.clientConfig.password != null) && (this.clientConfig.password.length > 0)) {
                return this.connectWithPassword(this.clientConfig.password);
            }
            else {
                var prompt_1 = "Enter password for ";
                prompt_1 += this.clientConfig.user;
                prompt_1 += "@";
                prompt_1 += this.clientConfig.host;
                prompt_1 += ":";
                return Utils.promptForPassword(prompt_1, function (password) {
                    if (password != null) {
                        return _this.connectWithPassword(password);
                    }
                    else {
                        var err = {};
                        err.canceled = true;
                        err.message = "Incorrect credentials for " + _this.clientConfig.host;
                        return _this.disconnect(err);
                    }
                });
            }
        };
        FTPFileSystem.prototype.connectWithPassword = function (password) {
            var _this = this;
            this.client = new FTPClient();
            this.client.on("ready", function () {
                _this.clientConfig.password = password;
                if (_this.config.storePassword) {
                    _this.config.password = password;
                    _this.config.passwordDecrypted = true;
                }
                return _this.setConnected(true);
            });
            this.client.on("close", function () {
                return _this.disconnect();
            });
            this.client.on("error", function (err) {
                if (err.code === 530) {
                    delete _this.clientConfig.password;
                    atom.notifications.addWarning("Incorrect credentials for " + _this.clientConfig.host);
                    return _this.connectImpl();
                }
                else {
                    return _this.disconnect(err);
                }
            });
            this.client.on("end", function () {
                return _this.disconnect();
            });
            var connectConfig = {};
            for (var key in this.clientConfig) {
                var val = this.clientConfig[key];
                connectConfig[key] = val;
            }
            connectConfig.password = password;
            return this.client.connect(connectConfig);
        };
        FTPFileSystem.prototype.disconnectImpl = function () {
            var _this = this;
            if (this.client != null) {
                this.client.logout(function () {
                    _this.client.end();
                    return _this.client = null;
                });
            }
            return this.setConnected(false);
        };
        FTPFileSystem.prototype.getClientConfig = function () {
            var result = {};
            result.host = this.config.host;
            result.port = this.config.port;
            result.user = this.config.user;
            result.password = this.config.password;
            return result;
        };
        FTPFileSystem.prototype.getSafeConfig = function () {
            var result = {};
            for (var key in this.config) {
                var val = this.config[key];
                result[key] = val;
            }
            if (this.config.storePassword) {
                result.password = Utils.encrypt(result.password, this.getDescription());
            }
            else {
                delete result.password;
            }
            delete result.passwordDecrypted;
            return result;
        };
        FTPFileSystem.prototype.getFile = function (path) {
            return new FTPFile(this, false, path);
        };
        FTPFileSystem.prototype.getDirectory = function (path) {
            return new FTPDirectory(this, false, path);
        };
        FTPFileSystem.prototype.getItemWithPathDescription = function (pathDescription) {
            if (pathDescription.isFile) {
                return new FTPFile(this, pathDescription.isLink, pathDescription.path, pathDescription.name);
            }
            return new FTPDirectory(this, pathDescription.isLink, pathDescription.path);
        };
        FTPFileSystem.prototype.getInitialDirectory = function () {
            return this.getDirectory(this.config.folder);
        };
        FTPFileSystem.prototype.getURI = function (item) {
            return this.config.protocol + "://" + PathUtil.join(this.config.host, item.path);
        };
        FTPFileSystem.prototype.getPathUtil = function () {
            return PathUtil;
        };
        FTPFileSystem.prototype.getPathFromURI = function (uri) {
            var root = this.config.protocol + "://" + this.config.host;
            if (uri.substring(0, root.length) === root) {
                return uri.substring(root.length);
            }
            return null;
        };
        FTPFileSystem.prototype.renameImpl = function (oldPath, newPath, callback) {
            return this.client.rename(oldPath, newPath, function (err) {
                if ((callback == null)) {
                    return;
                }
                if (err != null) {
                    return callback(err.message);
                }
                else {
                    return callback(null);
                }
            });
        };
        FTPFileSystem.prototype.makeDirectoryImpl = function (path, callback) {
            return this.client.mkdir(path, true, function (err) {
                if ((callback == null)) {
                    return;
                }
                if (err != null) {
                    return callback(err.message);
                }
                else {
                    return callback(null);
                }
            });
        };
        FTPFileSystem.prototype.deleteFileImpl = function (path, callback) {
            return this.client["delete"](path, function (err) {
                if ((callback == null)) {
                    return;
                }
                if (err != null) {
                    return callback(err.message);
                }
                else {
                    return callback(null);
                }
            });
        };
        FTPFileSystem.prototype.deleteDirectoryImpl = function (path, callback) {
            return this.client.rmdir(path, function (err) {
                if ((callback == null)) {
                    return;
                }
                if (err != null) {
                    return callback(err.message);
                }
                else {
                    return callback(null);
                }
            });
        };
        FTPFileSystem.prototype.getName = function () {
            return this.config.name;
        };
        FTPFileSystem.prototype.getHost = function () {
            return this.config.host;
        };
        FTPFileSystem.prototype.getDisplayName = function () {
            if (this.config.name && (this.config.name.trim().length > 0)) {
                return this.config.name;
            }
            return this.config.host;
        };
        FTPFileSystem.prototype.getUsername = function () {
            return this.config.user;
        };
        FTPFileSystem.prototype.getID = function () {
            return this.getLocalDirectoryName();
        };
        FTPFileSystem.prototype.getLocalDirectoryName = function () {
            return this.config.protocol + "_" + this.config.host + "_" + this.config.port + "_" + this.config.user;
        };
        FTPFileSystem.prototype.downloadImpl = function (path, localPath, callback) {
            return this.client.get(path, function (err, stream) {
                if (err != null) {
                    callback(err);
                    return;
                }
                stream.on("error", callback);
                stream.on("end", callback);
                return stream.pipe(fs.createWriteStream(localPath));
            });
        };
        FTPFileSystem.prototype.uploadImpl = function (localPath, path, callback) {
            return this.client.put(localPath, path, false, callback);
        };
        FTPFileSystem.prototype.newFileImpl = function (path, callback) {
            var _this = this;
            var buffer = new Buffer("", "utf8");
            return this.client.put(buffer, path, function (err) {
                if (err != null) {
                    return callback(null, err);
                }
                else {
                    return callback(_this.getFile(path), null);
                }
            });
        };
        FTPFileSystem.prototype.openFile = function (file) {
            return this.server.openFile(file);
        };
        FTPFileSystem.prototype.createReadStreamImpl = function (path, callback) {
            return this.client.get(path, callback);
        };
        FTPFileSystem.prototype.getDescription = function () {
            return this.config.protocol + "://" + this.config.host + ":" + this.config.port;
        };
        FTPFileSystem.prototype.getEntriesImpl = function (directory, callback) {
            return this.list(directory.getPath(), function (err, entries) {
                return callback(directory, err, entries);
            });
        };
        FTPFileSystem.prototype.list = function (path, callback) {
            var _this = this;
            return this.client.list(path, function (err, entries) {
                if (err != null) {
                    return callback(err, []);
                }
                else {
                    return callback(null, _this.wrapEntries(path, entries));
                }
            });
        };
        FTPFileSystem.prototype.wrapEntries = function (path, entries) {
            var directories = [];
            var files = [];
            for (var _i = 0, _a = Array.from(entries); _i < _a.length; _i++) {
                var entry = _a[_i];
                var wrappedEntry = this.wrapEntry(path, entry);
                if (wrappedEntry !== null) {
                    if (wrappedEntry.isFile()) {
                        files.push(wrappedEntry);
                    }
                    else {
                        directories.push(wrappedEntry);
                    }
                }
            }
            Utils.sortItems(files);
            Utils.sortItems(directories);
            return directories.concat(files);
        };
        FTPFileSystem.prototype.wrapEntry = function (path, entry) {
            if ((entry.name === ".") || (entry.name === "..")) {
                return null;
            }
            var item = null;
            if (entry.type === "d") {
                item = new FTPDirectory(this, false, PathUtil.join(path, entry.name));
            }
            else if (entry.type === "-") {
                item = new FTPFile(this, false, PathUtil.join(path, entry.name));
            }
            else if (entry.type === "l") {
                if (entry.target.indexOf('/') !== -1) {
                    item = new FTPDirectory(this, true, PathUtil.resolve(path, entry.target), entry.name);
                    // item = new FTPDirectory(@, true, PathUtil.join(path, entry.target), entry.name);
                }
                else {
                    item = new FTPFile(this, true, PathUtil.resolve(path, entry.target), entry.name);
                }
            }
            if (item != null) {
                item.modifyDate = entry.date;
                item.size = entry.size;
            }
            return item;
        };
        return FTPFileSystem;
    }(VFileSystem)));
//# sourceMappingURL=ftp-filesystem.js.map