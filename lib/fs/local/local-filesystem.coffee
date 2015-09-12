fs = require 'fs-plus'
VFileSystem = require '../vfilesystem'
LocalDirectory = require './local-directory'
{Directory} = require 'atom'

module.exports =
class LocalFileSystem extends VFileSystem

  constructor: ->
    super();

  isLocal: ->
    return true;

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

  makeDirectory: (path, callback) ->
    directory = new Directory(path);

    directory.create().then (created) =>
      if !callback?
        return;

      if created
        callback(null);
      else
        callback("Error creating folder.");
