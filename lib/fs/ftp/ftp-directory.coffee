PathUtil = require 'path'
VDirectory = require '../vdirectory'
FTPFile = require './ftp-file'
Utils = require '../../utils'

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
    @fileSystem.client.list @path, (err, entries) =>
      if err?
        console.log(err);
        callback(@, err, []);
      else
        callback(@, null, @wrapEntries(entries));

  wrapEntries: (entries) ->
    directories = [];
    files = [];

    for entry in entries
      wrappedEntry = @wrapEntry(entry);

      if wrappedEntry != null
        if wrappedEntry.isFile()
          files.push(wrappedEntry);
        else
          directories.push(wrappedEntry);

    Utils.sortItems(files);
    Utils.sortItems(directories);

    return directories.concat(files);

  wrapEntry: (entry) ->
    if (entry.name == ".") or (entry.name == "..")
      return null;

    if (entry.type == "d")
      return new FTPDirectory(@fileSystem, false, PathUtil.join(@path, entry.name));
    else if entry.type == "-"
      return new FTPFile(@fileSystem, false, PathUtil.join(@path, entry.name));
    else if (entry.type == "l")
      if entry.target.length >= 1 && entry.target[entry.target.length - 1] == '/'
        return new FTPDirectory(@fileSystem, true, PathUtil.join(@path, entry.name));
      else
        return new FTPFile(@fileSystem, true, PathUtil.resolve(@path, entry.target), entry.name);

    return null;

  onDidChange: (callback) ->
    return null;
    # return @directory.onDidChange(callback);
