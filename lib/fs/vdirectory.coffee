VItem = require 'vitem'

module.exports =
class VDirectory extends VItem

  constructor: (filesystem) ->
    super(filesystem);

  isFile: ->
    return false;

  isDirectory: ->
    return true;

  isRoot: ->

  getEntriesSync: ->
