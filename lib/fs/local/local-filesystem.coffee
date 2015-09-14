fsp = require 'fs-plus'
fse = require 'fs-extra'
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

  getSafeConfig: ->
    return {};

  getDirectory: (path) ->
    return new LocalDirectory(@, new Directory(path));

  getURI: (item) ->
    return item.getRealPathSync();

  rename: (oldPath, newPath, callback) ->
    fsp.moveSync(oldPath, newPath);
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

  deleteFile: (path, callback) ->
    fse.removeSync(path);

    if callback?
      callback(null);

  deleteDirectory: (path, callback) ->
    fse.removeSync(path);

    if callback?
      callback(null);

  download: (path, localPath, callback) ->
    fse.copy(path, localPath, callback);

  upload: (localPath, path, callback) ->
    fse.copy(localPath, path, callback);
