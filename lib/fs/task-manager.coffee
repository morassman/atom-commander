queue = require 'queue'
PathUtil = require('path')
fse = require 'fs-extra'
fs = require 'fs'
{CompositeDisposable, Emitter} = require 'atom'
Utils = require '../utils'

module.exports =
class TaskManager

  constructor: (@fileSystem) ->
    @emitter = new Emitter();
    @uploadCount = 0;
    @downloadCount = 0;
    @taskQueue = queue();
    @taskQueue.concurrency = 1;
    @disposables = new CompositeDisposable();

    @taskQueue.on "success", (result, job) =>
      @jobEnded(job, false, null);

    @taskQueue.on "error", (err, job) =>
      if err.canceled
        @jobEnded(job, true, err);
        @taskQueue.end(err);
      else
        @jobEnded(job, false, err);

    @taskQueue.on "end", (err) =>
      @setUploadCount(0);
      @setDownloadCount(0);

      if @emitter != null
        @emitter.emit("end", err);

    @disposables.add @fileSystem.onError (err) =>
      if @taskQueue.length == 0
        return;

      if err?
        Utils.showErrorWarning("Transfer failed", null, null, err, true);

      @taskQueue.end(err);

  onUploadCount: (callback) ->
    if @emitter != null
      return @emitter.on("uploadcount", callback);

  onDownloadCount: (callback) ->
    if @emitter != null
      return @emitter.on("downloadcount", callback);

  onEnd: (callback) ->
    if @emitter != null
      return @emitter.on("end", callback);

  jobEnded: (job, canceled, err) ->
    if job.upload
      @adjustUploadCount(-1);
    else if job.download
      @adjustDownloadCount(-1);

    job.callback?(canceled, err, job.item);

  adjustUploadCount: (diff) ->
    @setUploadCount(@uploadCount+diff);

  adjustDownloadCount: (diff) ->
    @setDownloadCount(@downloadCount+diff);

  setUploadCount: (uploadCount) ->
    old = @uploadCount;
    @uploadCount = uploadCount;

    if @emitter != null
      @emitter.emit("uploadcount", [old, @uploadCount]);

  setDownloadCount: (downloadCount) ->
    old = @downloadCount;
    @downloadCount = downloadCount;

    if @emitter != null
      @emitter.emit("downloadcount", [old, @downloadCount]);

  clearTasks: ->
    @taskQueue.end();

  dispose: ->
    @taskQueue.end();
    @fileSystem.disconnect();

  getFileSystem: ->
    return @fileSystem;

  getTaskCount: ->
    return @taskQueue.length;

  # callback receives two parameters:
  # 1.) err - null if there was no error.
  # 2.) item - The item that was uploaded.
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
    remoteFilePath = PathUtil.posix.join(remoteParentPath, file.getBaseName());

    task = (cb) =>
      @fileSystem.upload(file.getPath(), remoteFilePath, cb);

    @addUploadTask(task, file, callback);

  uploadDirectoryWithQueue: (remoteParentPath, directory, callback) ->
    remoteFolderPath = PathUtil.posix.join(remoteParentPath, directory.getBaseName());

    task1 = (cb) =>
      @fileSystem.makeDirectory(remoteFolderPath, cb);

    @addUploadTask(task1, directory, callback);

    task2 = (cb) =>
      directory.getEntries (dir, err, entries) =>
        if err?
          cb(err);
        else
          @uploadItemsWithQueue(remoteFolderPath, entries);
          cb();

    @addUploadTask(task2, directory, callback);

  # callback receives two parameters:
  # 1.) err - null if there was no error.
  # 2.) item - The item that was downloaded.
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

    task = (cb) =>
      file.download(localFilePath, cb);

    @addDownloadTask(task, file, callback);

  downloadDirectoryWithQueue: (localParentPath, directory, callback) ->
    localFolderPath = PathUtil.join(localParentPath, directory.getBaseName());

    task1 = (cb) =>
      fse.ensureDirSync(localFolderPath);
      cb();

    @addDownloadTask(task1, directory, callback);

    task2 = (cb) =>
      directory.getEntries (dir, err, entries) =>
        if err?
          cb(err);
        else
          @downloadItemsWithQueue(localFolderPath, entries, callback);
          cb();

    @addDownloadTask(task2, directory, callback);

  addUploadTask: (task, item, callback) ->
    task.upload = true;
    task.item = item;
    task.callback = callback;
    @adjustUploadCount(1);
    @taskQueue.push(task);

  addDownloadTask: (task, item, callback) ->
    task.download = true;
    task.item = item;
    task.callback = callback;
    @adjustDownloadCount(1);
    @taskQueue.push(task);
