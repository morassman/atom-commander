VFile = require '../vfile'

module.exports =
class LocalFile extends VFile

  constructor: (fileSystem, @file) ->
    super(fileSystem);

  existsSync: ->
    return @file.existsSync();

  getRealPathSync: ->
    return @file.getRealPathSync();

  getBaseName: ->
    return @file.getBaseName();

  getParent: ->
    return @fileSystem.getDirectory(@file.getParent().getRealPathSync());

  isWritable: ->
    return true;

  isLink: ->
    return @file.isSymbolicLink();
