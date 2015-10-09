PathUtil = require('path').posix
VFile = require '../vfile'

module.exports =
class FTPFile extends VFile

  constructor: (fileSystem, @link, @path, @baseName = null) ->
    super(fileSystem);
    @writable = true;

    if @baseName == null
      @baseName = PathUtil.basename(@path);

  isFile: ->
    return true;

  isDirectory: ->
    return false;

  existsSync: ->
    return true;

  getRealPathSync: ->
    return @path;

  getBaseName: ->
    return @baseName;

  getParent: ->
    return @fileSystem.getDirectory(PathUtil.dirname(@path));

  isWritable: ->
    return @writable;

  isLink: ->
    return @link;
