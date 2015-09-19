PathUtil = require 'path'
VDirectory = require '../vdirectory'

module.exports =
class FTPDirectory extends VDirectory

  constructor: (fileSystem, @link, @path) ->
    super(fileSystem);
    @writable = true;

  existsSync: ->
    return true;

  getRealPathSync: ->
    return @path;

  getBaseName: ->
    return PathUtil.basename(@path);

  getParent: ->
    return new FTPDirectory(@fileSystem, false, PathUtil.dirname(@path));

  isRoot: ->
    return PathUtil.dirname(@path) == @path;

  isWritable: ->
    return @writable;

  isLink: ->
    return @link;

  getEntriesSync: ->
    entries = [];

    # for entry in @directory.getEntriesSync()
    #   if entry.isDirectory()
    #     entries.push(new LocalDirectory(@fileSystem, entry));
    #   else
    #     entries.push(new LocalFile(@fileSystem, entry));

    return entries;

  getEntries: (callback) ->
    console.log("FTPDirectory.getEntries");
    @fileSystem.list @path, (err, entries) =>
      callback(@, err, entries);

  onDidChange: (callback) ->
    return null;
    # return @directory.onDidChange(callback);
