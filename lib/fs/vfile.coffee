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
    @fileSystem.download(@getPath(), localPath, callback);

  upload: (localPath, callback) ->
    @fileSystem.upload(localPath, @getPath(), callback);

  open: ->
    @fileSystem.openFile(@);

  # Callback receives two arguments:
  # 1.) err : String with error message. null if no error.
  # 2.) stream : A ReadableStream.
  createReadStream: (callback) ->
    @fileSystem.createReadStream(@getPath(), callback);
