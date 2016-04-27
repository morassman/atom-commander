VFile = require '../vfile'
fs = require 'fs'

module.exports =
class LocalFile extends VFile

  constructor: (fileSystem, @file) ->
    super(fileSystem);
    if @file.isSymbolicLink()
      stats = fs.lstatSync(@file.getRealPathSync());
    else
      stats = fs.statSync(@file.getRealPathSync());
    @modifyDate = stats.mtime;
    @size = stats.size;

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
