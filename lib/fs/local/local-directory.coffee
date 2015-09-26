fsp = require 'fs-plus'
VDirectory = require '../vdirectory'
LocalFile = require './local-file'

module.exports =
class LocalDirectory extends VDirectory

  constructor: (fileSystem, @directory) ->
    super(fileSystem);

  existsSync: ->
    return @directory.existsSync();

  getRealPathSync: ->
    return @directory.getRealPathSync();

  getBaseName: ->
    return @directory.getBaseName();

  getParent: ->
    return new LocalDirectory(@fileSystem, @directory.getParent());

  isRoot: ->
    return @directory.isRoot();

  isWritable: ->
    return true;

  isLink: ->
    return fsp.isSymbolicLinkSync(@getRealPathSync());

  onDidChange: (callback) ->
    return @directory.onDidChange(callback);
