VItem = require './vitem'

module.exports =
class VFile extends VItem

  constructor: (fileSystem) ->
    super(fileSystem);

  isFile: ->
    return true;

  isDirectory: ->
    return false;

  download: (localPath, callback) ->
    taskManager = @getFileSystem().getTaskManager();
    taskManager.getFileSystem().download(@getPath(), localPath, callback);

  upload: (localPath, callback) ->
    taskManager = @getFileSystem().getTaskManager();
    taskManager.getFileSystem().upload(localPath, @getPath(), callback);

  open: ->
    @fileSystem.openFile(@);

  # Callback receives two arguments:
  # 1.) err : String with error message. null if no error.
  # 2.) stream : A ReadableStream.
  createReadStream: (callback) ->
    @fileSystem.createReadStream(@getPath(), callback);
