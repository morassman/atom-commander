PathUtil = require('path').posix
VDirectory = require '../vdirectory'

module.exports =
class FTPDirectory extends VDirectory

  constructor: (fileSystem, @link, @path, @baseName = null) ->
    super(fileSystem);
    @writable = true;

    if @baseName == null
      @baseName = PathUtil.basename(@path);

  existsSync: ->
    return true;

  getRealPathSync: ->
    return @path;

  getBaseName: ->
    return @baseName;

  getParent: ->
    return new FTPDirectory(@fileSystem, false, PathUtil.dirname(@path));

  isRoot: ->
    return PathUtil.dirname(@path) == @path;

  isWritable: ->
    return @writable;

  isLink: ->
    return @link;

  onDidChange: (callback) ->
    return null;
    # return @directory.onDidChange(callback);
