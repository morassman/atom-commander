fsp = require 'fs-plus'
fse = require 'fs-extra'
PathUtil = require 'path'
FTPFileSystem = require '../fs/ftp/ftp-filesystem'
SFTPFileSystem = require '../fs/ftp/sftp-filesystem'
LocalFileSystem = require '../fs/local/local-filesystem'
RemoteFileManager = require './remote-file-manager'

module.exports =
class Server

  constructor: (@main, @config) ->
    @fileSystem = @createFileSystem();
    @localDirectoryName = @fileSystem.getLocalDirectoryName();
    @remoteFileManager = new RemoteFileManager(@);

  serialize: ->
    return @fileSystem.getSafeConfig();

  getLocalDirectoryPath: ->
    return PathUtil.join(@getServersPath(), @localDirectoryName);

  getLocalDirectoryName: ->
    return @localDirectoryName;

  getRemoteFileManager: ->
    return @remoteFileManager;

  getFileSystem: ->
    return @fileSystem;

  dispose: ->
    @fileSystem.disconnect();
    @fileSystem.dispose();

  createFileSystem: ->
    if @config.protocol == "ftp"
      return new FTPFileSystem(@, @config);
    else if @config.protocol == "sftp"
      return new SFTPFileSystem(@, @config);

    return new LocalFileSystem();

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

  getServersPath: ->
    return PathUtil.join(fsp.getHomeDirectory(), ".atom-commander", "servers");
