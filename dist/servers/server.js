/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var Server;
var fsp = require('fs-plus');
var fse = require('fs-extra');
var PathUtil = require('path');
var FTPFileSystem = require('../fs/ftp/ftp-filesystem');
var SFTPFileSystem = require('../fs/ftp/sftp-filesystem');
var RemoteFileManager = require('./remote-file-manager');
var CompositeDisposable = require('atom').CompositeDisposable;
module.exports =
    (Server = /** @class */ (function () {
        function Server(serverManager, config) {
            var _this = this;
            this.serverManager = serverManager;
            this.config = config;
            this.main = this.serverManager.getMain();
            this.fileSystem = this.createFileSystem();
            this.localDirectoryName = this.fileSystem.getLocalDirectoryName();
            this.remoteFileManager = new RemoteFileManager(this);
            this.disposables = new CompositeDisposable();
            var taskManager = this.fileSystem.getTaskManager();
            this.disposables.add(taskManager.onUploadCount(function (change) {
                return _this.serverManager.uploadCountChanged(change[0], change[1]);
            }));
            this.disposables.add(taskManager.onDownloadCount(function (change) {
                return _this.serverManager.downloadCountChanged(change[0], change[1]);
            }));
        }
        Server.prototype.getServerManager = function () {
            return this.serverManager;
        };
        Server.prototype.getConfig = function () {
            return this.config;
        };
        Server.prototype.getName = function () {
            return this.fileSystem.getName();
        };
        Server.prototype.getDisplayName = function () {
            return this.fileSystem.getDisplayName();
        };
        Server.prototype.getUsername = function () {
            return this.fileSystem.getUsername();
        };
        Server.prototype.serialize = function () {
            return this.fileSystem.getSafeConfig();
        };
        Server.prototype.getMain = function () {
            return this.main;
        };
        Server.prototype.getLocalDirectoryPath = function () {
            return PathUtil.join(this.getServersPath(), this.localDirectoryName);
        };
        Server.prototype.getCachePath = function () {
            return PathUtil.join(this.getLocalDirectoryPath(), "cache");
        };
        Server.prototype.getLocalDirectoryName = function () {
            return this.localDirectoryName;
        };
        Server.prototype.getRemoteFileManager = function () {
            return this.remoteFileManager;
        };
        Server.prototype.getFileSystem = function () {
            return this.fileSystem;
        };
        Server.prototype.dispose = function () {
            this.close();
            this.fileSystem.dispose();
            return this.disposables.dispose();
        };
        Server.prototype.createFileSystem = function () {
            if (this.config.protocol === "ftp") {
                return new FTPFileSystem(this, this.config);
            }
            else if (this.config.protocol === "sftp") {
                return new SFTPFileSystem(this.main, this, this.config);
            }
            return this.main.getLocalFileSystem();
        };
        Server.prototype.isFTP = function () {
            return this.config.protocol === "ftp";
        };
        Server.prototype.isSFTP = function () {
            return this.config.protocol === "sftp";
        };
        // Return a string that will be used when selecting a server from a list.
        Server.prototype.getDescription = function () {
            return this.fileSystem.getDescription();
        };
        Server.prototype.getRootDirectory = function () {
            return this.fileSystem.getDirectory("/");
        };
        Server.prototype.getInitialDirectory = function () {
            return this.fileSystem.getInitialDirectory();
        };
        Server.prototype.deleteLocalDirectory = function () {
            return fse.removeSync(this.getLocalDirectoryPath());
        };
        Server.prototype.openFile = function (file) {
            return this.remoteFileManager.openFile(file);
        };
        Server.prototype.getOpenFileCount = function () {
            return this.remoteFileManager.getOpenFileCount();
        };
        // Return the number of files in the cache.
        Server.prototype.getCacheFileCount = function () {
            var result = 0;
            var onFile = function (filePath) {
                return result++;
            };
            var onDirectory = function (directoryPath) {
                return true;
            };
            fsp.traverseTreeSync(this.getCachePath(), onFile, onDirectory);
            return result;
        };
        Server.prototype.getTaskCount = function () {
            return this.fileSystem.getTaskCount();
        };
        Server.prototype.getServersPath = function () {
            return PathUtil.join(fsp.getHomeDirectory(), ".atom-commander", "servers");
        };
        Server.prototype.getCachedFilePaths = function () {
            var result = [];
            var onFile = function (filePath) {
                return result.push(filePath);
            };
            var onDirectory = function (directoryPath) {
                return true;
            };
            fsp.traverseTreeSync(this.getCachePath(), onFile, onDirectory);
            return result;
        };
        Server.prototype.getWatcherWithLocalFilePath = function (localFilePath) {
            return this.remoteFileManager.getWatcherWithLocalFilePath(localFilePath);
        };
        // Return true if the connection to the server is open.
        Server.prototype.isOpen = function () {
            return this.fileSystem.isConnected();
        };
        Server.prototype.isClosed = function () {
            return !this.isOpen();
        };
        // Closes the connection to the server.
        Server.prototype.close = function () {
            var taskManager = this.fileSystem.getTaskManager(false);
            if (taskManager != null) {
                taskManager.clearTasks();
            }
            this.fileSystem.disconnect();
            return this.serverManager.serverClosed(this);
        };
        return Server;
    }()));
//# sourceMappingURL=server.js.map