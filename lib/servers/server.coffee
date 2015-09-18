FTPFileSystem = require '../fs/ftp/ftp-filesystem'
LocalFileSystem = require '../fs/local/local-filesystem'
RemoteFileManager = require './remote-file-manager'

module.exports =
class Server

  constructor: (@config) ->
    @remoteFileManager = new RemoteFileManager();
    @fileSystem = @createFileSystem();

  serialize: ->
    return @config;

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

    return new LocalFileSystem();

  # Return a string that will be used when selecting a server from a list.
  getDescription: ->
    return @fileSystem.getDescription();

  getRootDirectory: ->
    return @fileSystem.getDirectory("/");
