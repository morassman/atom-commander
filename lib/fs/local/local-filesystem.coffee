VFileSystem = require '../vfilesystem'
{Directory} = require 'atom'

module.exports =
class LocalFileSystem extends VFileSystem

  getDirectory: (path) ->
    return new LocalDirectory(@, new Directory(path));
