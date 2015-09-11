VFile = require '../vfile'

module.exports =
class LocalFile extends VFile

  constructor: (@file) ->

  existsSync: ->
    return @file.existsSync();

  getRealPathSync: ->
    return @file.getRealPathSync();

  getBaseName: ->
    return @file.getBaseName();

  getParent: ->
    return new LocalDirectory(@file.getParent());
