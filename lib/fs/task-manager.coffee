queue = require 'queue'
PathUtil = require 'path'
fse = require 'fs-extra'
fs = require 'fs'
{CompositeDisposable, Emitter} = require 'atom'

module.exports =
class TaskManager

  constructor: (@fileSystem) ->
    @emitter = new Emitter();
    @uploadCount = 0;
    @downloadCount = 0;
    @taskQueue = queue();
    @taskQueue.concurrency = 1;

    @taskQueue.on "success", (err, job) =>
      @jobEnded(job);

    @taskQueue.on "error", (err, job) =>
      console.log(err);
      @jobEnded(job);
      @taskQueue.end();

    @taskQueue.on "end", () =>
      @setUploadCount(0);
      @setDownloadCount(0);

  onUploadCount: (callback) ->
    if @emitter != null
      return @emitter.on("uploadcount", callback);

  onDownloadCount: (callback) ->
    if @emitter != null
      return @emitter.on("downloadcount", callback);

  jobEnded: (job) ->
    if job.upload
      @adjustUploadCount(-1);
    else if job.download
      @adjustDownloadCount(-1);

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
    remoteFilePath = PathUtil.join(remoteParentPath, file.getBaseName());

    task = (cb) =>
      @fileSystem.upload file.getPath(), remoteFilePath, (err) =>
        if err?
          callback?(err, file);
          cb(err);
        else
          callback?(null, file);
          cb();

    @addUploadTask(task);

  uploadDirectoryWithQueue: (remoteParentPath, directory, callback) ->
    remoteFolderPath = PathUtil.join(remoteParentPath, directory.getBaseName());

    task1 = (cb) =>
      @fileSystem.makeDirectory remoteFolderPath, (err) =>
        if err?
          callback?(err, directory);
        cb(err);

    @addUploadTask(task1);

    task2 = (cb) =>
      directory.getEntries (dir, err, entries) =>
        if err?
          callback?(err, directory);
          cb(err);
        else
          @uploadItemsWithQueue(remoteFolderPath, entries);
          cb();

    @addUploadTask(task2);

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
      file.download localFilePath, (err) =>
        if err?
          callback?(err, file);
          cb(err);
        else
          callback?(null, file);
          cb();

    @addDownloadTask(task);

  downloadDirectoryWithQueue: (localParentPath, directory, callback) ->
    localFolderPath = PathUtil.join(localParentPath, directory.getBaseName());

    task1 = (cb) =>
      fse.ensureDirSync(localFolderPath);
      cb();

    @addDownloadTask(task1);

    task2 = (cb) =>
      directory.getEntries (dir, err, entries) =>
        if err?
          callback?(err, directory);
          cb(err);
        else
          @downloadItemsWithQueue(localFolderPath, entries, callback);
          cb();

    @addDownloadTask(task2);

  addUploadTask: (task) ->
    task.upload = true;
    @adjustUploadCount(1);
    @taskQueue.push(task);

  addDownloadTask: (task) ->
    task.download = true;
    @adjustDownloadCount(1);
    @taskQueue.push(task);
