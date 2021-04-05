/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let ServerManager;
const Server = require('./server');
const fsp = require('fs-plus');

module.exports =
(ServerManager = class ServerManager {

  constructor(main, state) {
    this.main = main;
    this.servers = [];
    this.uploadCount = 0;
    this.downloadCount = 0;

    if (state != null) {
      for (let config of Array.from(state)) {
        this.addServer(config, false);
      }
    }
  }

  getMain() {
    return this.main;
  }

  getUploadCount() {
    return this.uploadCount;
  }

  getDownloadCount() {
    return this.downloadCount;
  }

  addServer(config, save) {
    if (save == null) { save = true; }
    const server = new Server(this, config);
    this.servers.push(server);

    if (save) {
      this.main.saveState();
    }

    return server;
  }

  removeServer(server) {
    return this.removeServerImpl(server, true, true);
  }

  removeServerImpl(server, deleteLocalDirectory, save) {
    const index = this.servers.indexOf(server);

    if (index >= 0) {
      this.servers.splice(index, 1);
    }

    const fileSystem = server.getFileSystem();

    if (deleteLocalDirectory) {
      server.deleteLocalDirectory();
    }

    server.dispose();
    this.main.fileSystemRemoved(fileSystem);

    if (save) {
      return this.main.saveState();
    }
  }

  // Changes the given server's configuration. This is called after
  // a server's config has been edited. The existing server will be
  // removed, but its cache will not be deleted. The name of the
  // cache's folder will be renamed based on the new config and
  // a new server will be created with the new config.
  changeServerConfig(server, config) {
    // By removing the server its bookmarks will be removed as well.
    // It is therefore necessary to get its bookmarks before removing it.
    const oldFSID = server.getFileSystem().getID();
    const bookmarks = this.main.bookmarkManager.getBookmarksWithFileSystemId(oldFSID);

    this.removeServerImpl(server, false, false);
    const newServer = this.addServer(config, false);

    const oldPath = server.getLocalDirectoryPath();
    const newPath = newServer.getLocalDirectoryPath();

    if (fsp.existsSync(oldPath) && (oldPath !== newPath)) {
      fsp.moveSync(oldPath, newPath);
    }

    // Update bookmarks.
    const newFS = newServer.getFileSystem();

    for (let bookmark of Array.from(bookmarks)) {
      const item = newFS.getItemWithPathDescription(bookmark.pathDescription);
      bookmark.pathDescription = item.getPathDescription();
    }

    this.main.bookmarkManager.addBookmarks(bookmarks);
    return this.main.saveState();
  }

  getServers() {
    return this.servers;
  }

  getServerCount() {
    return this.servers.length;
  }

  getServerWithLocalDirectoryName(localDirectoryName) {
    for (let server of Array.from(this.servers)) {
      if (server.getLocalDirectoryName() === localDirectoryName) {
        return server;
      }
    }

    return null;
  }

  getFileSystemWithID(fileSystemId) {
    for (let server of Array.from(this.servers)) {
      const fileSystem = server.getFileSystem();

      if (fileSystem.getID() === fileSystemId) {
        return fileSystem;
      }
    }

    return null;
  }

  getWatcherWithLocalFilePath(localFilePath) {
    for (let server of Array.from(this.servers)) {
      const watcher = server.getWatcherWithLocalFilePath(localFilePath);

      if (watcher !== null) {
        return watcher;
      }
    }

    return null;
  }

  uploadCountChanged(old, current) {
    this.uploadCount += current - old;
    return this.main.refreshStatus();
  }

  downloadCountChanged(old, current) {
    this.downloadCount += current - old;
    return this.main.refreshStatus();
  }

  serverClosed(server) {
    return this.main.serverClosed(server);
  }

  dispose() {
    return Array.from(this.servers).map((server) =>
      server.dispose());
  }

  serialize() {
    const state = [];

    for (let server of Array.from(this.servers)) {
      state.push(server.serialize());
    }

    return state;
  }
});
