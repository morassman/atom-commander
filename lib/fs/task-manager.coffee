queue = require 'queue'
PathUtil = require 'path'
fse = require 'fs-extra'
fs = require 'fs'

module.exports =
class TaskManager

  constructor: (@fileSystem) ->
    @taskQueue = queue();
    @taskQueue.concurrency = 1;

    @taskQueue.on "error", (err, job) =>
      console.log(err);
      @taskQueue.end();

  dispose: ->
    @taskQueue.end();
    @fileSystem.disconnect();

  getFileSystem: ->
    return @fileSystem;

  getTaskCount: ->
    return @taskQueue.length;

  uploadItem: (remoteParentPath, item, callback) ->
    @uploadItems(remoteParentPath, [item], callback);

  uploadItems: (remoteParentPath, items, callback) ->
    @uploadItemsWithQueue(remoteParentPath, items, callback);
    @taskQueue.start();

  uploadItemsWithQueue: (remoteParentPath, items, callback) ->
    for item in items
      if !item.isLink()
        if item.isFile()
          @uploadFileWithQueue(remoteParentPath, item, callback);
        else
          @uploadDirectoryWithQueue(remoteParentPath, item, callback);

  uploadFileWithQueue: (remoteParentPath, file, callback) ->
    remoteFilePath = PathUtil.join(remoteParentPath, file.getBaseName());

    @taskQueue.push (cb) =>
      @fileSystem.upload file.getPath(), remoteFilePath, (err) =>
        if err?
          callback?(err, file);
          cb(err);
        else
          callback?(null, file);
          cb();

  uploadDirectoryWithQueue: (remoteParentPath, directory, callback) ->
    remoteFolderPath = PathUtil.join(remoteParentPath, directory.getBaseName());

    @taskQueue.push (cb) =>
      @fileSystem.makeDirectory remoteFolderPath, (err) =>
        if err?
          callback?(err, directory);
        cb(err);

    @taskQueue.push (cb) =>
      directory.getEntries (dir, err, entries) =>
        if err?
          callback?(err, directory);
          cb(err);
        else
          @uploadItemsWithQueue(remoteFolderPath, entries);
          cb();

  downloadItem: (localParentPath, item, callback) ->
    @downloadItems(localParentPath, [item], callback);

  downloadItems: (localParentPath, items, callback) ->
    @downloadItemsWithQueue(localParentPath, items, callback);
    @taskQueue.start();

  downloadItemsWithQueue: (localParentPath, items, callback) ->
    for item in items
      if !item.isLink()
        if item.isFile()
          @downloadFileWithQueue(localParentPath, item, callback);
        else
          @downloadDirectoryWithQueue(localParentPath, item, callback);

  downloadFileWithQueue: (localParentPath, file, callback) ->
    localFilePath = PathUtil.join(localParentPath, file.getBaseName());

    @taskQueue.push (cb) =>
      file.download localFilePath, (err) =>
        if err?
          callback?(err, file);
          cb(err);
        else
          callback?(null, file);
          cb();

  downloadDirectoryWithQueue: (localParentPath, directory, callback) ->
    localFolderPath = PathUtil.join(localParentPath, directory.getBaseName());

    @taskQueue.push (cb) =>
      fse.ensureDirSync(localFolderPath);
      cb();

    @taskQueue.push (cb) =>
      directory.getEntries (dir, err, entries) =>
        if err?
          callback?(err, directory);
          cb(err);
        else
          @downloadItemsWithQueue(localFolderPath, entries, callback);
          cb();
