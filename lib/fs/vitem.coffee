module.exports =
class VItem

  constructor: (@fileSystem) ->

  getURI: ->
    return @fileSystem.getURI(@);

  getPath: ->
    return @getRealPathSync();

  isFile: ->

  isDirectory: ->

  isWritable: ->

  existsSync: ->

  getRealPathSync: ->

  getBaseName: ->

  getParent: ->
