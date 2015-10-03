fsp = require 'fs-plus'
fse = require 'fs-extra'
PathUtil = require 'path'
FTPFileSystem = require '../fs/ftp/ftp-filesystem'
SFTPFileSystem = require '../fs/ftp/sftp-filesystem'
RemoteFileManager = require './remote-file-manager'
{CompositeDisposable} = require 'atom'

module.exports =
class Server

  constructor: (@serverManager, @config) ->
    @main = @serverManager.getMain();
    @fileSystem = @createFileSystem();
    @localDirectoryName = @fileSystem.getLocalDirectoryName();
    @remoteFileManager = new RemoteFileManager(@);
    @disposables = new CompositeDisposable();

    taskManager = @fileSystem.getTaskManager();
    @disposables.add taskManager.onUploadCount (change) =>
      @serverManager.uploadCountChanged(change[0], change[1]);
    @disposables.add taskManager.onDownloadCount (change) =>
      @serverManager.downloadCountChanged(change[0], change[1]);

  getName: ->
    return @fileSystem.getName();

  serialize: ->
    return @fileSystem.getSafeConfig();

  getMain: ->
    return @main;

  getLocalDirectoryPath: ->
    return PathUtil.join(@getServersPath(), @localDirectoryName);

  getCachePath: ->
    return PathUtil.join(@getLocalDirectoryPath(), "cache");

  getLocalDirectoryName: ->
    return @localDirectoryName;

  getRemoteFileManager: ->
    return @remoteFileManager;

  getFileSystem: ->
    return @fileSystem;

  dispose: ->
    @close();
    @fileSystem.dispose();
    @disposables.dispose();

  createFileSystem: ->
    if @config.protocol == "ftp"
      return new FTPFileSystem(@, @config);
    else if @config.protocol == "sftp"
      return new SFTPFileSystem(@, @config);

    return @main.getLocalFileSystem();

  # Return a string that will be used when selecting a server from a list.
  getDescription: ->
    return @fileSystem.getDescription();

  getRootDirectory: ->
    return @fileSystem.getDirectory("/");

  getInitialDirectory: ->
    return @fileSystem.getInitialDirectory();

  deleteLocalDirectory: ->
    fse.removeSync(@getLocalDirectoryPath());

  openFile: (file) ->
    @remoteFileManager.openFile(file);

  getOpenFileCount: ->
    return @remoteFileManager.getOpenFileCount();

  getTaskCount: ->
    return @fileSystem.getTaskCount();

  getServersPath: ->
    return PathUtil.join(fsp.getHomeDirectory(), ".atom-commander", "servers");

  getCachedFilePaths: ->
    result = [];

    onFile = (filePath) =>
      result.push(filePath)
    onDirectory = (directoryPath) =>
      return true;

    fsp.traverseTreeSync(@getCachePath(), onFile, onDirectory);

    return result;

  getWatcherWithLocalFilePath: (localFilePath) ->
    return @remoteFileManager.getWatcherWithLocalFilePath(localFilePath);

  # Return true if the connection to the server is open.
  isOpen: ->
    return @fileSystem.isConnected();

  # Closes the connection to the server.
  close: ->
    @fileSystem.disconnect();

    taskManager = @fileSystem.getTaskManager(false);
    taskManager?.dispose();
