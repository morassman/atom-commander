/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Server;
const fsp = require('fs-plus');
const fse = require('fs-extra');
const PathUtil = require('path');
const FTPFileSystem = require('../fs/ftp/ftp-filesystem');
const SFTPFileSystem = require('../fs/ftp/sftp-filesystem');
const RemoteFileManager = require('./remote-file-manager');
const {CompositeDisposable} = require('atom');

module.exports =
(Server = class Server {

  constructor(serverManager, config) {
    this.serverManager = serverManager;
    this.config = config;
    this.main = this.serverManager.getMain();
    this.fileSystem = this.createFileSystem();
    this.localDirectoryName = this.fileSystem.getLocalDirectoryName();
    this.remoteFileManager = new RemoteFileManager(this);
    this.disposables = new CompositeDisposable();

    const taskManager = this.fileSystem.getTaskManager();
    this.disposables.add(taskManager.onUploadCount(change => {
      return this.serverManager.uploadCountChanged(change[0], change[1]);
    })
    );
    this.disposables.add(taskManager.onDownloadCount(change => {
      return this.serverManager.downloadCountChanged(change[0], change[1]);
    })
    );
  }

  getServerManager() {
    return this.serverManager;
  }

  getConfig() {
    return this.config;
  }

  getName() {
    return this.fileSystem.getName();
  }

  getDisplayName() {
    return this.fileSystem.getDisplayName();
  }

  getUsername() {
    return this.fileSystem.getUsername();
  }

  serialize() {
    return this.fileSystem.getSafeConfig();
  }

  getMain() {
    return this.main;
  }

  getLocalDirectoryPath() {
    return PathUtil.join(this.getServersPath(), this.localDirectoryName);
  }

  getCachePath() {
    return PathUtil.join(this.getLocalDirectoryPath(), "cache");
  }

  getLocalDirectoryName() {
    return this.localDirectoryName;
  }

  getRemoteFileManager() {
    return this.remoteFileManager;
  }

  getFileSystem() {
    return this.fileSystem;
  }

  dispose() {
    this.close();
    this.fileSystem.dispose();
    return this.disposables.dispose();
  }

  createFileSystem() {
    if (this.config.protocol === "ftp") {
      return new FTPFileSystem(this, this.config);
    } else if (this.config.protocol === "sftp") {
      return new SFTPFileSystem(this.main, this, this.config);
    }

    return this.main.getLocalFileSystem();
  }

  isFTP() {
    return this.config.protocol === "ftp";
  }

  isSFTP() {
    return this.config.protocol === "sftp";
  }

  // Return a string that will be used when selecting a server from a list.
  getDescription() {
    return this.fileSystem.getDescription();
  }

  getRootDirectory() {
    return this.fileSystem.getDirectory("/");
  }

  getInitialDirectory() {
    return this.fileSystem.getInitialDirectory();
  }

  deleteLocalDirectory() {
    return fse.removeSync(this.getLocalDirectoryPath());
  }

  openFile(file) {
    return this.remoteFileManager.openFile(file);
  }

  getOpenFileCount() {
    return this.remoteFileManager.getOpenFileCount();
  }

  // Return the number of files in the cache.
  getCacheFileCount() {
    let result = 0;

    const onFile = filePath => {
      return result++;
    };
    const onDirectory = directoryPath => {
      return true;
    };

    fsp.traverseTreeSync(this.getCachePath(), onFile, onDirectory);

    return result;
  }

  getTaskCount() {
    return this.fileSystem.getTaskCount();
  }

  getServersPath() {
    return PathUtil.join(fsp.getHomeDirectory(), ".atom-commander", "servers");
  }

  getCachedFilePaths() {
    const result = [];

    const onFile = filePath => {
      return result.push(filePath);
    };
    const onDirectory = directoryPath => {
      return true;
    };

    fsp.traverseTreeSync(this.getCachePath(), onFile, onDirectory);

    return result;
  }

  getWatcherWithLocalFilePath(localFilePath) {
    return this.remoteFileManager.getWatcherWithLocalFilePath(localFilePath);
  }

  // Return true if the connection to the server is open.
  isOpen() {
    return this.fileSystem.isConnected();
  }

  isClosed() {
    return !this.isOpen();
  }

  // Closes the connection to the server.
  close() {
    const taskManager = this.fileSystem.getTaskManager(false);
    if (taskManager != null) {
      taskManager.clearTasks();
    }
    this.fileSystem.disconnect();
    return this.serverManager.serverClosed(this);
  }
});
