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
var SFTPFileSystem;
var fs = require('fs');
var fsp = require('fs-plus');
var PathUtil = require('path').posix;
var VFileSystem = require('../vfilesystem');
var FTPFile = require('./ftp-file');
var FTPDirectory = require('./ftp-directory');
var FTPSymLink = require('./ftp-symlink');
var SFTPSession = require('./sftp-session');
var Utils = require('../../utils');
module.exports =
    (SFTPFileSystem = /** @class */ (function (_super) {
        __extends(SFTPFileSystem, _super);
        function SFTPFileSystem(main, server, config) {
            var _this = this;
            _this.server = server;
            _this.config = config;
            _this = _super.call(this, main) || this;
            _this.session = null;
            _this.client = null;
            if (!_this.config.passwordDecrypted) {
                if ((_this.config.password != null) && (_this.config.password.length > 0)) {
                    _this.config.password = Utils.decrypt(_this.config.password, _this.getDescription());
                }
                if ((_this.config.passphrase != null) && (_this.config.passphrase.length > 0)) {
                    _this.config.passphrase = Utils.decrypt(_this.config.passphrase, _this.getDescription());
                }
                _this.config.passwordDecrypted = true;
            }
            _this.clientConfig = _this.getClientConfig();
            return _this;
        }
        SFTPFileSystem.prototype.clone = function () {
            var cloneFS = new SFTPFileSystem(this.getMain(), this.server, this.config);
            cloneFS.clientConfig = this.clientConfig;
            return cloneFS;
        };
        SFTPFileSystem.prototype.isLocal = function () {
            return false;
        };
        SFTPFileSystem.prototype.connectImpl = function () {
            this.session = new SFTPSession(this);
            return this.session.connect();
        };
        SFTPFileSystem.prototype.disconnectImpl = function () {
            if (this.session != null) {
                return this.session.disconnect();
            }
        };
        SFTPFileSystem.prototype.sessionOpened = function (session) {
            if (session === this.session) {
                this.client = session.getClient();
                return this.setConnected(true);
            }
        };
        SFTPFileSystem.prototype.sessionCanceled = function (session) {
            if (session === this.session) {
                this.session = null;
                return this.setConnected(false);
            }
        };
        SFTPFileSystem.prototype.sessionClosed = function (session) {
            if (session === this.session) {
                this.session = null;
                this.client = null;
                return this.setConnected(false);
            }
        };
        SFTPFileSystem.prototype.getClientConfig = function () {
            var result = {};
            result.host = this.config.host;
            result.port = this.config.port;
            result.username = this.config.username;
            result.password = this.config.password;
            result.passphrase = this.config.passphrase;
            result.tryKeyboard = true;
            result.keepaliveInterval = 60000;
            if (!this.config.loginWithPassword) {
                try {
                    result.privateKey = this.getPrivateKey(this.config.privateKeyPath);
                }
                catch (err) {
                    Utils.showErrorWarning("Error reading private key", null, null, err, true);
                }
            }
            return result;
        };
        SFTPFileSystem.prototype.getPrivateKey = function (path) {
            if (!path || (path.length === 0)) {
                return '';
            }
            path = Utils.resolveHome(path);
            if (!fsp.isFileSync(path)) {
                return '';
            }
            return fs.readFileSync(path, 'utf8');
        };
        SFTPFileSystem.prototype.getSafeConfig = function () {
            var result = {};
            for (var key in this.config) {
                var val = this.config[key];
                result[key] = val;
            }
            if (this.config.storePassword) {
                if ((this.config.password != null) && (this.config.password.length > 0)) {
                    result.password = Utils.encrypt(result.password, this.getDescription());
                }
                if ((this.config.passphrase != null) && (this.config.passphrase.length > 0)) {
                    result.passphrase = Utils.encrypt(result.passphrase, this.getDescription());
                }
            }
            else {
                delete result.password;
                delete result.passphrase;
            }
            delete result.privateKey;
            delete result.passwordDecrypted;
            return result;
        };
        SFTPFileSystem.prototype.getFile = function (path) {
            return new FTPFile(this, false, path);
        };
        SFTPFileSystem.prototype.getDirectory = function (path) {
            return new FTPDirectory(this, false, path);
        };
        SFTPFileSystem.prototype.getItemWithPathDescription = function (pathDescription) {
            if (pathDescription.isFile) {
                return new FTPFile(this, pathDescription.isLink, pathDescription.path, pathDescription.name);
            }
            return new FTPDirectory(this, pathDescription.isLink, pathDescription.path);
        };
        SFTPFileSystem.prototype.getInitialDirectory = function () {
            return this.getDirectory(this.config.folder);
        };
        SFTPFileSystem.prototype.getURI = function (item) {
            return this.config.protocol + "://" + PathUtil.join(this.config.host, item.path);
        };
        SFTPFileSystem.prototype.getPathUtil = function () {
            return PathUtil;
        };
        SFTPFileSystem.prototype.getPathFromURI = function (uri) {
            var root = this.config.protocol + "://" + this.config.host;
            if (uri.substring(0, root.length) === root) {
                return uri.substring(root.length);
            }
            return null;
        };
        SFTPFileSystem.prototype.renameImpl = function (oldPath, newPath, callback) {
            return this.client.rename(oldPath, newPath, function (err) {
                if ((callback == null)) {
                    return;
                }
                if (err != null) {
                    return callback(err);
                }
                else {
                    return callback(null);
                }
            });
        };
        SFTPFileSystem.prototype.makeDirectoryImpl = function (path, callback) {
            return this.client.mkdir(path, [], function (err) {
                if ((callback == null)) {
                    return;
                }
                if (err != null) {
                    return callback(err);
                }
                else {
                    return callback(null);
                }
            });
        };
        SFTPFileSystem.prototype.deleteFileImpl = function (path, callback) {
            return this.client.unlink(path, function (err) {
                if ((callback == null)) {
                    return;
                }
                if (err != null) {
                    return callback(err);
                }
                else {
                    return callback(null);
                }
            });
        };
        SFTPFileSystem.prototype.deleteDirectoryImpl = function (path, callback) {
            return this.client.rmdir(path, function (err) {
                if ((callback == null)) {
                    return;
                }
                if (err != null) {
                    return callback(err);
                }
                else {
                    return callback(null);
                }
            });
        };
        SFTPFileSystem.prototype.getName = function () {
            return this.config.name;
        };
        SFTPFileSystem.prototype.getDisplayName = function () {
            if (this.config.name && (this.config.name.trim().length > 0)) {
                return this.config.name;
            }
            return this.config.host;
        };
        SFTPFileSystem.prototype.getHost = function () {
            return this.config.host;
        };
        SFTPFileSystem.prototype.getUsername = function () {
            return this.config.username;
        };
        SFTPFileSystem.prototype.getID = function () {
            return this.getLocalDirectoryName();
        };
        SFTPFileSystem.prototype.getLocalDirectoryName = function () {
            return this.config.protocol + "_" + this.config.host + "_" + this.config.port + "_" + this.config.username;
        };
        SFTPFileSystem.prototype.downloadImpl = function (path, localPath, callback) {
            return this.client.fastGet(path, localPath, {}, callback);
        };
        SFTPFileSystem.prototype.uploadImpl = function (localPath, path, callback) {
            return this.client.fastPut(localPath, path, {}, callback);
        };
        SFTPFileSystem.prototype.openFile = function (file) {
            return this.server.getRemoteFileManager().openFile(file);
        };
        SFTPFileSystem.prototype.createReadStreamImpl = function (path, callback) {
            var rs = this.client.createReadStream(path);
            return callback(null, rs);
        };
        SFTPFileSystem.prototype.getDescription = function () {
            return this.config.protocol + "://" + this.config.host + ":" + this.config.port;
        };
        SFTPFileSystem.prototype.getEntriesImpl = function (directory, callback) {
            return this.list(directory.getPath(), function (err, entries) {
                return callback(directory, err, entries);
            });
        };
        SFTPFileSystem.prototype.list = function (path, callback) {
            var _this = this;
            return this.client.readdir(path, function (err, entries) {
                if (err != null) {
                    return callback(err, []);
                }
                else {
                    return callback(null, _this.wrapEntries(path, entries));
                }
            });
        };
        SFTPFileSystem.prototype.wrapEntries = function (path, entries) {
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
        SFTPFileSystem.prototype.wrapEntry = function (path, entry) {
            var item = null;
            if (entry.attrs.isDirectory()) {
                item = new FTPDirectory(this, false, PathUtil.join(path, entry.filename));
            }
            else if (entry.attrs.isFile()) {
                item = new FTPFile(this, false, PathUtil.join(path, entry.filename));
            }
            else if (entry.attrs.isSymbolicLink()) {
                item = this.wrapSymLinkEntry(path, entry);
            }
            if (item != null) {
                item.modifyDate = new Date(entry.attrs.mtime * 1000);
                item.size = entry.attrs.size;
            }
            return item;
        };
        SFTPFileSystem.prototype.wrapSymLinkEntry = function (path, entry) {
            var _this = this;
            var fullPath = PathUtil.join(path, entry.filename);
            var result = new FTPSymLink(this, fullPath);
            this.client.stat(fullPath, function (err, stat) {
                if (err != null) {
                    return;
                }
                result.setModifyDate(new Date(entry.attrs.mtime * 1000));
                result.setSize(entry.attrs.size);
                return _this.client.readlink(fullPath, function (err, target) {
                    if (err != null) {
                        return;
                    }
                    if (stat.isFile()) {
                        return result.setTargetFilePath(target);
                    }
                    else if (stat.isDirectory()) {
                        return result.setTargetDirectoryPath(PathUtil.join(path, target));
                    }
                });
            });
            return result;
        };
        SFTPFileSystem.prototype.newFileImpl = function (path, callback) {
            var _this = this;
            return this.client.open(path, "w", {}, function (err, handle) {
                if (err != null) {
                    callback(null, err);
                    return;
                }
                return _this.client.close(handle, function (err) {
                    if (err != null) {
                        callback(null, err);
                        return;
                    }
                    return callback(_this.getFile(path), null);
                });
            });
        };
        return SFTPFileSystem;
    }(VFileSystem)));
//# sourceMappingURL=sftp-filesystem.js.map