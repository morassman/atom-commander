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

  isLocal: ->

  connect: ->

  disconnect: ->

  isConnected: ->

  getDirectory: (path) ->

  getURI: (item) ->

  # Callback receives a single string argument with error message. null if no error.
  rename: (oldPath, newPath, callback) ->

  # Callback receives a single string argument with error message. null if no error.
  makeDirectory: (path, callback) ->

  # Callback receives a single string argument with error message. null if no error.
  deleteFile: (path, callback) ->
    
  # Callback receives a single string argument with error message. null if no error.
  deleteDirectory: (path, callback) ->
