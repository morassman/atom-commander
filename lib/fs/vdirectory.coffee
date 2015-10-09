VItem = require './vitem'

module.exports =
class VDirectory extends VItem

  constructor: (fileSystem) ->
    super(fileSystem);

  isFile: ->
    return false;

  isDirectory: ->
    return true;

  isRoot: ->

  # The callback received three parameters :
  # 1.) This directory.
  # 2.) err. null if no error.
  # 3.) The list of entries containing VFile and VDirectory instances.
  getEntries: (callback) ->
    @fileSystem.getEntries(@, callback);

  onDidChange: (callback) ->

  getFile: (name) ->
    pathUtil = @fileSystem.getPathUtil();
    return @fileSystem.getFile(pathUtil.join(@getPath(), name));

  # The callback receives one parameter :
  # 1.) file : The file that was created. null if it could not be created.
  newFile: (name, callback) ->
    pathUtil = @fileSystem.getPathUtil();
    @fileSystem.newFile(pathUtil.join(@getPath(), name), callback);
