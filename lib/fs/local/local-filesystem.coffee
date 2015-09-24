fsp = require 'fs-plus'
fse = require 'fs-extra'
VFileSystem = require '../vfilesystem'
LocalFile = require './local-file'
LocalDirectory = require './local-directory'
{Directory, File} = require 'atom'

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

  getFile: (path) ->
    return new LocalFile(@, new File(path));

  getDirectory: (path) ->
    return new LocalDirectory(@, new Directory(path));

  getItemWithPathDescription: (pathDescription) ->
    if pathDescription.isFile
      return @getFile(pathDescription.path);

    return @getDirectory(pathDescription.path);

  getURI: (item) ->
    return item.getRealPathSync();

  getID: ->
    return "local";

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

  openFile: (file) ->
    atom.workspace.open(file.getRealPathSync());

  createReadStream: (path, callback) ->
    callback(null, fse.createReadStream(path));

  newFile: (path, callback) ->
    file = new File(path);

    file.create().then (created) =>
      if created
        callback(@getFile(path));
      else
        callback(null);
