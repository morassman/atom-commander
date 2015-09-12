fs = require 'fs-plus'
VFileSystem = require '../vfilesystem'
LocalDirectory = require './local-directory'
{Directory} = require 'atom'

module.exports =
class LocalFileSystem extends VFileSystem

  constructor: ->
    super();

  isConnected: ->
    return true;

  getDirectory: (path) ->
    return new LocalDirectory(@, new Directory(path));

  getURI: (item) ->
    return item.getRealPathSync();

  rename: (oldPath, newPath, callback) ->
    fs.moveSync(oldPath, newPath);
    if callback != null
      callback(null);
