path = require 'path'
Client = require 'ftp'
VFileSystem = require '../vfilesystem'
FTPDirectory = require './ftp-directory'

module.exports =
class FTPFileSystem extends VFileSystem

  constructor: (@config) ->
    super();
    @connected = false;

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

  getDirectory: (path) ->
    return new FTPDirectory(@, path);

  getURI: (item) ->
    return "ftp://" + path.join(@config.host, item.path);

  rename: (oldPath, newPath, callback) ->
    @client.rename oldPath, newPath, (err) =>
      if callback?
        if err?
          callback(err.message);
        else
          callback(null);
