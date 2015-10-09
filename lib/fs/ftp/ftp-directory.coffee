PathUtil = require('path').posix
VDirectory = require '../vdirectory'

module.exports =
class FTPDirectory extends VDirectory

  constructor: (fileSystem, @link, @path) ->
    super(fileSystem);
    @writable = true;

  existsSync: ->
    return true;

  getRealPathSync: ->
    return @path;

  getBaseName: ->
    return PathUtil.basename(@path);

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
