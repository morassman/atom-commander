VDirectory = require '../vdirectory'
LocalFile = require './local-file'
fs = require 'fs'

module.exports =
class LocalDirectory extends VDirectory

  constructor: (fileSystem, @directory) ->
    super(fileSystem);
    if @directory.isSymbolicLink()
      stats = fs.lstatSync(@directory.getRealPathSync());
    else
      stats = fs.statSync(@directory.getRealPathSync());
    @modifyDate = stats.mtime;
    @size = stats.size;

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
    return @directory.isSymbolicLink();

  onDidChange: (callback) ->
    return @directory.onDidChange(callback);
