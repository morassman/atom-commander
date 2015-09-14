fs = require 'fs'
path = require 'path'
Client = require 'ftp'
VFileSystem = require '../vfilesystem'
FTPDirectory = require './ftp-directory'

module.exports =
class FTPFileSystem extends VFileSystem

  constructor: (@config) ->
    super();
    @connected = false;

  isLocal: ->
    return false;

  connect: ->
    @client = new Client();

    @client.on "ready", =>
      console.log("ready");
      @setConnected(true);

    @client.on "close", =>
      @setConnected(false);

    @client.on "error", (err) =>
      console.log("Error");
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
    return new FTPDirectory(@, path);

  getURI: (item) ->
    return "ftp://" + path.join(@config.host, item.path);

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
    return @config.host;

  download: (path, localPath, callback) ->
    @client.get path, (err, stream) =>
      if !err?
        stream.pipe(fs.createWriteStream(localPath));
      callback(err);

  upload: (localPath, path, callback) ->
    @client.put(localPath, path, false, callback);
