{Emitter} = require 'atom'

module.exports =
class VFileSystem

  constructor: ->
    @emitter = new Emitter();

  dispose: ->
    @emitter.dispose();

  onConnected: (callback) ->
    @emitter.on("connected", callback);

  onDisconnected: (callback) ->
    @emitter.on("disconnected", callback);

  emitConnected: ->
    @emitter.emit("connected");

  emitDisconnected: ->
    @emitter.emit("disconnected");

  isRemote: ->
    return !@isLocal();

  # Returns the path part of the URI relative to this file system. null if this
  # URI doesn't match this file system.
  # Example : "sftp://localhost/Test/Path" => "/Test/Path"
  getPathFromURI: (uri) ->
    return uri;

  getInitialDirectory: ->
    return @getDirectory("/");

  isLocal: ->

  connect: ->

  disconnect: ->

  isConnected: ->

  getFile: (path) ->

  getDirectory: (path) ->

  getItemWithPathDescription: (pathDescription) ->

  getURI: (item) ->

  # Returns an string that uniquely IDs this file system.
  getID: ->

  # Callback receives a single string argument with error message. null if no error.
  rename: (oldPath, newPath, callback) ->

  # Callback receives a single string argument with error message. null if no error.
  makeDirectory: (path, callback) ->

  # Callback receives a single string argument with error message. null if no error.
  deleteFile: (path, callback) ->

  # Callback receives a single string argument with error message. null if no error.
  deleteDirectory: (path, callback) ->

  getSafeConfig: ->

  download: (path, localPath, callback) ->

  openFile: (file) ->

  # The callback receives one parameter :
  # 1.) file : The file that was created. null if it could not be created.
  newFile: (path, callback) ->
