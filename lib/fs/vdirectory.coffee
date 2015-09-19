VItem = require './vitem'
PathUtil = require 'path'

module.exports =
class VDirectory extends VItem

  constructor: (fileSystem) ->
    super(fileSystem);

  isFile: ->
    return false;

  isDirectory: ->
    return true;

  isRoot: ->

  getEntriesSync: ->

  # The callback received two parameters :
  # 1.) This directory.
  # 2.) The list of entries containing VFile and VDirectory instances.
  getEntries: (callback) ->

  onDidChange: (callback) ->

  getFile: (name) ->
    return @fileSystem.getFile(PathUtil.join(@getPath(), name));

  # The callback receives one parameter :
  # 1.) file : The file that was created. null if it could not be created.
  newFile: (name, callback) ->
    @fileSystem.newFile(PathUtil.join(@getPath(), name), callback);
