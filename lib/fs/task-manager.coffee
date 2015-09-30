queue = require 'queue'
PathUtil = require 'path'
fse = require 'fs-extra'
fs = require 'fs'

module.exports =
class TaskManager

  constructor: (@fileSystem) ->
    @downloadQueue = queue();
    @downloadQueue.concurrency = 1;

    @downloadQueue.on "error", (err, job) =>
      console.log("error");
      console.log(err);
      @downloadQueue.end();

    @downloadQueue.on "success", (result, job) =>
      console.log("success");
      console.log(result);

    @downloadQueue.on "end", =>
      console.log("end");

    @uploadQueue = queue();
    @uploadQueue.concurrency = 1;

    @uploadQueue.on "error", (err, job) =>
      console.log("error");
      console.log(err);
      @uploadQueue.end();

    @uploadQueue.on "success", (result, job) =>
      console.log("success");
      console.log(result);

    @uploadQueue.on "end", =>
      console.log("end");

  uploadItems: (remoteParentPath, items) ->
    @uploadItemsWithQueue(remoteParentPath, items);
    @uploadQueue.start();

  uploadItemsWithQueue: (remoteParentPath, items) ->
    console.log("uploadItemsWithQueue : "+remoteParentPath);

    for item in items
      if !item.isLink()
        if item.isFile()
          @uploadFileWithQueue(remoteParentPath, item);
        else
          @uploadDirectoryWithQueue(remoteParentPath, item);

  uploadFileWithQueue: (remoteParentPath, file) ->
    remoteFilePath = PathUtil.join(remoteParentPath, file.getBaseName());
    console.log("uploadFileWithQueue : "+remoteFilePath);

    @uploadQueue.push (cb) =>
      console.log("file : "+file.getPath());
      @fileSystem.upload file.getPath(), remoteFilePath, (err) =>
        if err?
          console.log("upload error");
          cb(err);
        else
          console.log("uploaded "+remoteFilePath);
          cb();

  uploadDirectoryWithQueue: (remoteParentPath, directory) ->
    remoteFolderPath = PathUtil.join(remoteParentPath, directory.getBaseName());
    console.log("uploadDirectoryWithQueue : "+remoteFolderPath);

    @uploadQueue.push (cb) =>
      @fileSystem.makeDirectory remoteFolderPath, (err) =>
        console.log("upload makeDirectory");
        console.log(err);
        cb(err);

    @uploadQueue.push (cb) =>
      console.log("dir : "+directory.getPath());
      directory.getEntries (dir, err, entries) =>
        if err?
          console.log("dir error");
          console.log(err);
          cb(err);
        else
          @uploadItemsWithQueue(remoteFolderPath, entries);
          cb();

  downloadItems: (localParentPath, items) ->
    @downloadItemsWithQueue(localParentPath, items);
    @downloadQueue.start();

  downloadItemsWithQueue: (localParentPath, items) ->
    console.log("downloadItemsWithQueue : "+localParentPath);

    for item in items
      if !item.isLink()
        if item.isFile()
          @downloadFileWithQueue(localParentPath, item);
        else
          @downloadDirectoryWithQueue(localParentPath, item);

  downloadFileWithQueue: (localParentPath, file) ->
    localFilePath = PathUtil.join(localParentPath, file.getBaseName());
    console.log("downloadFileWithQueue : "+localFilePath);

    @downloadQueue.push (cb) =>
      console.log("file : "+file.getPath());
      file.download localFilePath, (err) =>
        if err?
          console.log("download error");
          cb(err);
        else
          console.log("downloaded "+localFilePath);
          cb();

  downloadDirectoryWithQueue: (localParentPath, directory) ->
    localFolderPath = PathUtil.join(localParentPath, directory.getBaseName());
    console.log("downloadDirectoryWithQueue : "+localFolderPath);

    @downloadQueue.push (cb) =>
      fse.ensureDirSync(localFolderPath);
      cb();

    @downloadQueue.push (cb) =>
      console.log("dir : "+directory.getPath());
      directory.getEntries (dir, err, entries) =>
        if err?
          console.log("dir error");
          console.log(err);
          cb(err);
        else
          @downloadItemsWithQueue(localFolderPath, entries);
          cb();
