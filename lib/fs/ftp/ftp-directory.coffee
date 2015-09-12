path = require 'path'
VDirectory = require '../vdirectory'
FTPFile = require './ftp-file'

module.exports =
class FTPDirectory extends VDirectory

  constructor: (fileSystem, @path) ->
    super(fileSystem);
    @writable = true;

  existsSync: ->
    return true;

  getRealPathSync: ->
    return @path;

  getBaseName: ->
    return path.basename(@path);

  getParent: ->
    return new FTPDirectory(@fileSystem, path.dirname(@path));

  isRoot: ->
    return path.dirname(@path) == @path;

  isWritable: ->
    return @writable;

  getEntriesSync: ->
    entries = [];

    # for entry in @directory.getEntriesSync()
    #   if entry.isDirectory()
    #     entries.push(new LocalDirectory(@fileSystem, entry));
    #   else
    #     entries.push(new LocalFile(@fileSystem, entry));

    return entries;

  getEntries: (callback) ->
    @fileSystem.client.list @path, (err, entries) =>
      if err
        console.log(err);
      else
        callback(@, @wrapEntries(entries));

  wrapEntries: (entries) ->
    result = [];

    for entry in entries
      wrappedEntry = @wrapEntry(entry);

      if wrappedEntry != null
        result.push(wrappedEntry);

    return result;

  wrapEntry: (entry) ->
    if (entry.name == ".") or (entry.name == "..")
      return null;

    if (entry.type == "d") or (entry.type == "l")
      return new FTPDirectory(@fileSystem, path.join(@path, entry.name));
    else if entry.type == "-"
      return new FTPFile(@fileSystem, path.join(@path, entry.name));

    return null;

  onDidChange: (callback) ->
    return null;
    # return @directory.onDidChange(callback);
