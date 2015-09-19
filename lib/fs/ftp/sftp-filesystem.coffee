fs = require 'fs'
PathUtil = require 'path'
FTPClient = require 'ftp'
SSH2 = require 'ssh2'
VFileSystem = require '../vfilesystem'
FTPFile = require './ftp-file'
FTPDirectory = require './ftp-directory'
Utils = require '../../utils'

module.exports =
class SFTPFileSystem extends VFileSystem

  constructor: (@server, @config) ->
    super();
    @connected = false;
    @client = null;

  isLocal: ->
    return false;

  connect: ->
    @client = null;
    @ssh2 = new SSH2();

    @ssh2.on "ready", =>
      @ssh2.sftp (err, sftp) =>
        if err?
          @setConnected(false);
          return;

        @client = sftp;

        @client.on "end", =>
          @disconnect();

        @setConnected(true);

    @ssh2.on "close", =>
      @setConnected(false);
      @client = null;
      @ssh2 = null;

    @ssh2.on "error", (err) =>
      console.log(err);
      @client = null;
      @ssh2 = null;

    @ssh2.on "end", =>
      @setConnected(false);
      @client = null;
      @ssh2 = null;

    @ssh2.on "keyboard-interactive", (name, instructions, instructionsLang, prompt, finish) =>
      finish([@config.password]);

    @ssh2.connect(@config);

  disconnect: ->
    if @client?
      @client.end();
      @client = null;

    if @ssh2?
      @ssh2.end();
      @ssh2 = null;

    @setConnected(false);

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

  getFile: (path) ->
    return new FTPFile(@, false, path);

  getDirectory: (path) ->
    return new FTPDirectory(@, false, path);

  getURI: (item) ->
    return @config.protocol+"://" + PathUtil.join(@config.host, item.path);

  rename: (oldPath, newPath, callback) ->
    @client.rename oldPath, newPath, (err) =>
      if !callback?
        return;

      if err?
        callback(err.message);
      else
        callback(null);

  makeDirectory: (path, callback) ->
    @client.mkdir path, [], (err) =>
      if !callback?
        return;

      if err?
        callback(err.message);
      else
        callback(null);

  deleteFile: (path, callback) ->
    @client.unlink path, (err) =>
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
    return @config.host + "_" + @config.port + "_" + @config.username;

  download: (path, localPath, callback) ->
    @client.fastGet(path, localPath, {}, callback);

  upload: (localPath, path, callback) ->
    @client.fastPut(localPath, path, {}, callback);

  openFile: (file) ->
    @server.getRemoteFileManager().openFile(file);

  getDescription: ->
    return @config.protocol+"://"+@config.host+":"+@config.port;

  list: (path, callback) ->
    @client.readdir path, (err, entries) =>
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
    if entry.attrs.isDirectory()
      if entry.attrs.isSymbolicLink()
        return new FTPDirectory(@, true, PathUtil.join(path, entry.filename));
      else
        return new FTPDirectory(@, false, PathUtil.join(path, entry.filename));
    else if entry.attrs.isFile()
      if entry.attrs.isSymbolicLink()
        console.log("Symbolic link!");
        console.log(entry);
        # return new FTPFile(@, true, PathUtil.resolve(path, entry.target), entry.name);
      else
        return new FTPFile(@, false, PathUtil.join(path, entry.filename));

    return null;

  newFile: (path, callback) ->
    @client.open path, "w", {}, (err, handle) =>
      if err?
        callback(null);
        return;

      @client.close handle, (err) =>
        if err?
          callback(null);
          return;

        callback(@getFile(path));
