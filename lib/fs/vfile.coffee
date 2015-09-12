VItem = require './vitem'

module.exports =
class VFile extends VItem

  constructor: (fileSystem) ->
    super(fileSystem);

  isFile: ->
    return true;

  isDirectory: ->
    return false;
