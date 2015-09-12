path = require 'path'
VFile = require '../vfile'

module.exports =
class FTPFile extends VFile

  constructor: (fileSystem, @path, @writable = true) ->
    super(fileSystem);

  isFile: ->
    return true;

  isDirectory: ->
    return false;

  existsSync: ->
    return true;

  getRealPathSync: ->
    return @path;

  getBaseName: ->
    return path.basename(@path);

  getParent: ->
    return @fileSystem.getDirectory(path.dirname(@path));

  isWritable: ->
    return @writable;
