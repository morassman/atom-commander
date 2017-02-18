fsp = require 'fs-plus'
fse = require 'fs-extra'
VFileSystem = require '../vfilesystem'
LocalFile = require './local-file'
LocalDirectory = require './local-directory'
{Directory, File} = require 'atom'
PathUtil = require 'path'

module.exports =
class LocalFileSystem extends VFileSystem

  constructor: (main) ->
    super(main);

  clone: ->
    return new LocalFileSystem(@getMain());

  isLocal: ->
    return true;

  connectImpl: ->
    @setConnected(true);

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

  getName: ->
    return "local";

  getID: ->
    return "local";

  getUsername: ->
    return "";

  getPathUtil: ->
    return PathUtil;

  renameImpl: (oldPath, newPath, callback) ->
    fsp.moveSync(oldPath, newPath);
    if callback != null
      callback(null);

  makeDirectoryImpl: (path, callback) ->
    directory = new Directory(path);

    directory.create().then (created) =>
      if !callback?
        return;

      if created
        callback(null);
      else
        callback("Error creating folder.");

  deleteFileImpl: (path, callback) ->
    fse.removeSync(path);

    if callback?
      callback(null);

  deleteDirectoryImpl: (path, callback) ->
    fse.removeSync(path);

    if callback?
      callback(null);

  downloadImpl: (path, localPath, callback) ->
    fse.copy(path, localPath, callback);

  upload: (localPath, path, callback) ->
    fse.copy(localPath, path, callback);

  openFile: (file) ->
    atom.workspace.open(file.getRealPathSync());
    @fileOpened(file);

  createReadStreamImpl: (path, callback) ->
    callback(null, fse.createReadStream(path));

  newFileImpl: (path, callback) ->
    file = new File(path);

    p = file.create().then (created) =>
      if created
        callback(@getFile(path), null);
      else
        callback(null, 'File could not be created.');
    p.catch (error) =>
      callback(null, error);

  getEntriesImpl: (directory, callback) ->
    directory.directory.getEntries (err, entries) =>
      if err?
        callback(directory, err, []);
      else
        callback(directory, null, @wrapEntries(entries));

  wrapEntries: (entries) ->
    result = [];

    for entry in entries
      # Added a try/catch, because it was found that there are sometimes
      # temporary files created by the OS in the list of entries that no
      # exist by the time they get here. Reading them then threw an error.
      try
        if entry.isDirectory()
          result.push(new LocalDirectory(@, entry));
        else
          result.push(new LocalFile(@, entry));
      catch error
        console.error(error);

    return result;
