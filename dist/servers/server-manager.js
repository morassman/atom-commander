/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var ServerManager;
var Server = require('./server');
var fsp = require('fs-plus');
module.exports =
    (ServerManager = /** @class */ (function () {
        function ServerManager(main, state) {
            this.main = main;
            this.servers = [];
            this.uploadCount = 0;
            this.downloadCount = 0;
            if (state != null) {
                for (var _i = 0, _a = Array.from(state); _i < _a.length; _i++) {
                    var config = _a[_i];
                    this.addServer(config, false);
                }
            }
        }
        ServerManager.prototype.getMain = function () {
            return this.main;
        };
        ServerManager.prototype.getUploadCount = function () {
            return this.uploadCount;
        };
        ServerManager.prototype.getDownloadCount = function () {
            return this.downloadCount;
        };
        ServerManager.prototype.addServer = function (config, save) {
            if (save == null) {
                save = true;
            }
            var server = new Server(this, config);
            this.servers.push(server);
            if (save) {
                this.main.saveState();
            }
            return server;
        };
        ServerManager.prototype.removeServer = function (server) {
            return this.removeServerImpl(server, true, true);
        };
        ServerManager.prototype.removeServerImpl = function (server, deleteLocalDirectory, save) {
            var index = this.servers.indexOf(server);
            if (index >= 0) {
                this.servers.splice(index, 1);
            }
            var fileSystem = server.getFileSystem();
            if (deleteLocalDirectory) {
                server.deleteLocalDirectory();
            }
            server.dispose();
            this.main.fileSystemRemoved(fileSystem);
            if (save) {
                return this.main.saveState();
            }
        };
        // Changes the given server's configuration. This is called after
        // a server's config has been edited. The existing server will be
        // removed, but its cache will not be deleted. The name of the
        // cache's folder will be renamed based on the new config and
        // a new server will be created with the new config.
        ServerManager.prototype.changeServerConfig = function (server, config) {
            // By removing the server its bookmarks will be removed as well.
            // It is therefore necessary to get its bookmarks before removing it.
            var oldFSID = server.getFileSystem().getID();
            var bookmarks = this.main.bookmarkManager.getBookmarksWithFileSystemId(oldFSID);
            this.removeServerImpl(server, false, false);
            var newServer = this.addServer(config, false);
            var oldPath = server.getLocalDirectoryPath();
            var newPath = newServer.getLocalDirectoryPath();
            if (fsp.existsSync(oldPath) && (oldPath !== newPath)) {
                fsp.moveSync(oldPath, newPath);
            }
            // Update bookmarks.
            var newFS = newServer.getFileSystem();
            for (var _i = 0, _a = Array.from(bookmarks); _i < _a.length; _i++) {
                var bookmark = _a[_i];
                var item = newFS.getItemWithPathDescription(bookmark.pathDescription);
                bookmark.pathDescription = item.getPathDescription();
            }
            this.main.bookmarkManager.addBookmarks(bookmarks);
            return this.main.saveState();
        };
        ServerManager.prototype.getServers = function () {
            return this.servers;
        };
        ServerManager.prototype.getServerCount = function () {
            return this.servers.length;
        };
        ServerManager.prototype.getServerWithLocalDirectoryName = function (localDirectoryName) {
            for (var _i = 0, _a = Array.from(this.servers); _i < _a.length; _i++) {
                var server = _a[_i];
                if (server.getLocalDirectoryName() === localDirectoryName) {
                    return server;
                }
            }
            return null;
        };
        ServerManager.prototype.getFileSystemWithID = function (fileSystemId) {
            for (var _i = 0, _a = Array.from(this.servers); _i < _a.length; _i++) {
                var server = _a[_i];
                var fileSystem = server.getFileSystem();
                if (fileSystem.getID() === fileSystemId) {
                    return fileSystem;
                }
            }
            return null;
        };
        ServerManager.prototype.getWatcherWithLocalFilePath = function (localFilePath) {
            for (var _i = 0, _a = Array.from(this.servers); _i < _a.length; _i++) {
                var server = _a[_i];
                var watcher = server.getWatcherWithLocalFilePath(localFilePath);
                if (watcher !== null) {
                    return watcher;
                }
            }
            return null;
        };
        ServerManager.prototype.uploadCountChanged = function (old, current) {
            this.uploadCount += current - old;
            return this.main.refreshStatus();
        };
        ServerManager.prototype.downloadCountChanged = function (old, current) {
            this.downloadCount += current - old;
            return this.main.refreshStatus();
        };
        ServerManager.prototype.serverClosed = function (server) {
            return this.main.serverClosed(server);
        };
        ServerManager.prototype.dispose = function () {
            return Array.from(this.servers).map(function (server) {
                return server.dispose();
            });
        };
        ServerManager.prototype.serialize = function () {
            var state = [];
            for (var _i = 0, _a = Array.from(this.servers); _i < _a.length; _i++) {
                var server = _a[_i];
                state.push(server.serialize());
            }
            return state;
        };
        return ServerManager;
    }()));
//# sourceMappingURL=server-manager.js.map