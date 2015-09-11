VItem = require 'vitem'

module.exports =
class VFile extends VItem

  constructor: (filesystem) ->
    super(filesystem);

  isFile: ->
    return true;

  isDirectory: ->
    return false;
