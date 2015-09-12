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

  getEntriesSync: ->

  # The callback received two arguments :
  # 1.) This directory.
  # 2.) The list of entries containing VFile and VDirectory instances.
  getEntries: (callback) ->

  onDidChange: (callback) ->
