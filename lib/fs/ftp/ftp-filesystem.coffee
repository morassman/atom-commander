fs = require 'fs'
FTPClient = require 'ftp'
PathUtil = require 'path'
VFileSystem = require '../vfilesystem'
FTPFile = require './ftp-file'
FTPDirectory = require './ftp-directory'
Utils = require '../../utils'

module.exports =
class FTPFileSystem extends VFileSystem

  constructor: (@server, @config) ->
    super();
    @connected = false;

  isLocal: ->
    return false;

  connect: ->
    @client = new FTPClient();

    @client.on "ready", =>
      @setConnected(true);

    @client.on "close", =>
      @setConnected(false);

    @client.on "error", (err) =>
      console.log(err);

    @client.on "end", =>
      @setConnected(false);

    @client.connect(@config);

  disconnect: ->
    if @isConnected()
      @client.logout =>
        @client.end();
        @client = null;

  isConnected: ->
    return @connected and (@client != null);

  setConnected: (connected) ->
    if @connected == connected
      return;

    @connected = connected;

    if @connected
      @emitConnected();
    else
      @emitDisconnected();

  getSafeConfig: ->
    return @config;

  getDirectory: (path) ->
    return new FTPDirectory(@, false, path);

  getURI: (item) ->
    return @config.protocol+"://" + PathUtil.join(@config.host, item.path);

  getPathFromURI: (uri) ->
    root = @config.protocol+"://"+@config.host;

    if uri.substring(0, root.length) == root
      return uri.substring(root.length);

    return null;

  rename: (oldPath, newPath, callback) ->
    @client.rename oldPath, newPath, (err) =>
      if !callback?
        return;

      if err?
        callback(err.message);
      else
        callback(null);

  makeDirectory: (path, callback) ->
    @client.mkdir path, true, (err) =>
      if !callback?
        return;

      if err?
        callback(err.message);
      else
        callback(null);

  deleteFile: (path, callback) ->
    @client.delete path, (err) =>
      if !callback?
        return;

      if err?
        callback(err.message);
      else
        callback(null);

  deleteDirectory: (path, callback) ->
    @client.rmdir path, (err) =>
      if !callback?
        return;

      if err?
        callback(err.message);
      else
        callback(null);

  getLocalDirectoryName: ->
    return @config.host + @config.port;

  download: (path, localPath, callback) ->
    @client.get path, (err, stream) =>
      if !err?
        stream.pipe(fs.createWriteStream(localPath));
      callback(err);

  upload: (localPath, path, callback) ->
    @client.put(localPath, path, false, callback);

  openFile: (file) ->
    @server.openFile(file);

  getDescription: ->
    return @config.protocol+"://"+@config.host+":"+@config.port;

  list: (path, callback) ->
    @client.list path, (err, entries) =>
      if err?
        console.log(err);
        callback(err, []);
      else
        callback(null, @wrapEntries(path, entries));

  wrapEntries: (path, entries) ->
    directories = [];
    files = [];

    for entry in entries
      wrappedEntry = @wrapEntry(path, entry);

      if wrappedEntry != null
        if wrappedEntry.isFile()
          files.push(wrappedEntry);
        else
          directories.push(wrappedEntry);

    Utils.sortItems(files);
    Utils.sortItems(directories);

    return directories.concat(files);

  wrapEntry: (path, entry) ->
    if (entry.name == ".") or (entry.name == "..")
      return null;

    if (entry.type == "d")
      return new FTPDirectory(@, false, PathUtil.join(path, entry.name));
    else if entry.type == "-"
      return new FTPFile(@, false, PathUtil.join(path, entry.name));
    else if (entry.type == "l")
      if entry.target.length >= 1 && entry.target[entry.target.length - 1] == '/'
        return new FTPDirectory(@, true, PathUtil.join(path, entry.name));
      else
        return new FTPFile(@, true, PathUtil.resolve(path, entry.target), entry.name);

    return null;
