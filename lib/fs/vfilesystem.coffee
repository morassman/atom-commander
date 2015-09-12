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

  connect: ->

  disconnect: ->

  isConnected: ->

  getDirectory: (path) ->

  getURI: (item) ->

  # Callback receives a single argument called err.
  rename: (oldPath, newPath, callback) ->
