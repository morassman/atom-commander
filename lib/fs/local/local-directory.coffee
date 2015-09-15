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

  getEntriesSync: ->
    return @wrapEntries(@directory.getEntriesSync());

  getEntries: (callback) ->
    @directory.getEntries (err, entries) =>
      if err?
        console.log(err);
      else
        callback(@, @wrapEntries(entries));

  wrapEntries: (entries) ->
    result = [];

    for entry in entries
      if entry.isDirectory()
        result.push(new LocalDirectory(@fileSystem, entry));
      else
        result.push(new LocalFile(@fileSystem, entry));

    return result;

  onDidChange: (callback) ->
    return @directory.onDidChange(callback);
