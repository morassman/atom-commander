module.exports =
class VItem

  constructor: (@fileSystem) ->

  getURI: ->
    return @fileSystem.getURI(@);

  isFile: ->

  isDirectory: ->

  isWritable: ->

  existsSync: ->

  getPath: ->
    return @getRealPathSync();

  getRealPathSync: ->

  getBaseName: ->

  getParent: ->
