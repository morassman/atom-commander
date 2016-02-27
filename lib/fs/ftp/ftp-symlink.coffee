VSymLink = require '../vsymlink'
PathUtil = require('path').posix
FTPFile = require './ftp-file'
FTPDirectory = require './ftp-directory'

module.exports =
class FTPSymLink extends VSymLink

  constructor: (fileSystem, @path, @baseName = null) ->
    super(fileSystem);
    @writable = true;

    if @baseName == null
      @baseName = PathUtil.basename(@path);

  getRealPathSync: ->
    return @path;

  getBaseName: ->
    return @baseName;

  getParent: ->
    return @fileSystem.getDirectory(PathUtil.dirname(@path));

  isWritable: ->
    return @writable;

  createFileItem: (targetPath) ->
    return new FTPFile(@getFileSystem(), false, targetPath);

  createDirectoryItem: (targetPath) ->
    return new FTPDirectory(@getFileSystem(), false, targetPath);
