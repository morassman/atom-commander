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
