q = require 'q'
{CompositeDisposable, Emitter} = require 'atom'
TaskManager = require './task-manager'

module.exports =
class VFileSystem

  constructor: (@main) ->
    @emitter = new Emitter();
    @taskManager = null;
    @connecting = false;
    @connected = false;

  getMain: ->
    return @main;

  getTaskManager: (create=true) ->
    if (@taskManager == null) and create
      @taskManager = new TaskManager(@clone());

    return @taskManager;

  getTaskCount: ->
    if @taskManager == null
      return 0;

    return @taskManager.getTaskCount();

  dispose: ->
    @emitter.dispose();
    @emitter = null;

  connectPromise: ->
    deferred = q.defer();

    if @isConnected()
      deferred.resolve();
      return deferred.promise;

    disposables = new CompositeDisposable();

    disposables.add @onConnected =>
      disposables.dispose();
      disposables = null;
      deferred.resolve();

    disposables.add @onError (err) =>
      disposables.dispose();
      disposables = null;
      deferred.reject(err);

    @connect();

    return deferred.promise;

  onConnected: (callback) ->
    if @emitter != null
      return @emitter.on("connected", callback);

  onDisconnected: (callback) ->
    if @emitter != null
      return @emitter.on("disconnected", callback);

  # Callback receives a single 'err' parameter.
  onError: (callback) ->
    if @emitter != null
      return @emitter.on("error", callback);

  emitConnected: ->
    if @emitter != null
      @emitter.emit("connected");

  emitDisconnected: ->
    if @emitter != null
      @emitter.emit("disconnected");

  emitError: (err) ->
    if @emitter != null
      @emitter.emit("error", err);

  isRemote: ->
    return !@isLocal();

  isConnecting: ->
    return @connecting;

  connect: ->
    if !@isConnected() && !@isConnecting()
      @connecting = true;
      @connectImpl();

  disconnect: (err) ->
    @disconnectImpl();

    if err?
      @emitError(err);

  isConnected: ->
    return @connected;

  setConnected: (connected) ->
    @connecting = false;

    if @connected == connected
      return;

    @connected = connected;

    if @connected
      @emitConnected();
    else
      @emitDisconnected();

  # Returns a clone of this file system. This is used for the TaskManager so
  # that transfers can be done while the file system can still be browsed.
  clone: ->

  connectImpl: ->

  disconnectImpl: ->

  # Returns the path part of the URI relative to this file system. null if this
  # URI doesn't match this file system.
  # Example : "sftp://localhost/Test/Path" => "/Test/Path"
  getPathFromURI: (uri) ->
    return uri;

  getInitialDirectory: ->
    return @getDirectory("/");

  isLocal: ->

  getFile: (path) ->

  getDirectory: (path) ->

  getItemWithPathDescription: (pathDescription) ->

  getURI: (item) ->

  getName: ->

  # Returns an string that uniquely IDs this file system.
  getID: ->

  getSafeConfig: ->

  getPathUtil: ->

  getUsername: ->

  # Callback receives a single string argument with error message. null if no error.
  rename: (oldPath, newPath, callback) ->
    successCallback = () =>
      @renameImpl(oldPath, newPath, callback);

    @connectPromise().then(successCallback, callback);

  renameImpl: (oldPath, newPath, callback) ->

  # Callback receives a single string argument with error message. null if no error.
  makeDirectory: (path, callback) ->
    successCallback = () =>
      @makeDirectoryImpl(path, callback);

    @connectPromise().then(successCallback, callback);

  makeDirectoryImpl: (path, callback) ->

  # Callback receives a single string argument with error message. null if no error.
  deleteFile: (path, callback) ->
    successCallback = () =>
      @deleteFileImpl(path, callback);

    @connectPromise().then(successCallback, callback);

  deleteFileImpl: (path, callback) ->

  # Callback receives a single string argument with error message. null if no error.
  deleteDirectory: (path, callback) ->
    successCallback = () =>
      @deleteDirectoryImpl(path, callback);

    @connectPromise().then(successCallback, callback);

  deleteDirectoryImpl: (path, callback) ->

  # Callback receives a single string argument with error message. null if no error.
  download: (path, localPath, callback) ->
    successCallback = () =>
      @downloadImpl(path, localPath, callback);

    @connectPromise().then(successCallback, callback);

  downloadImpl: (path, localPath, callback) ->

  openFile: (file) ->

  fileOpened: (file) ->
    hideOnOpen = atom.config.get('atom-commander.panel.hideOnOpen');

    if hideOnOpen
      @main.hidePanel();

  # Callback receives two arguments:
  # 1.) err : String with error message. null if no error.
  # 2.) stream : A ReadableStream.
  createReadStream: (path, callback) ->
    successCallback = () =>
      @createReadStreamImpl(path, callback);

    errorCallback = (err) =>
      callback(err, null);

    @connectPromise().then(successCallback, errorCallback);

  createReadStreamImpl: (path, callback) ->

  # The callback receives two parameters :
  # 1.) file : The file that was created. null if it could not be created.
  # 2.) err : The error if the file could not be created.
  newFile: (path, callback) ->
    successCallback = () =>
      @newFileImpl(path, callback);

    errorCallback = (err) =>
      callback(null, err);

    @connectPromise().then(successCallback, errorCallback);

  newFileImpl: (path, callback) ->

  # The callback received three parameters :
  # 1.) The directory.
  # 2.) err if there is an error. null if not.
  # 3.) The list of entries containing VFile and VDirectory instances.
  getEntries: (directory, callback) ->
    successCallback = () =>
      @getEntriesImpl(directory, callback);

    errorCallback = (err) =>
      callback(directory, err, []);

    @connectPromise().then(successCallback, errorCallback);

  getEntriesImpl: (directory, callback) ->

  upload: (localPath, path, callback) ->
    successCallback = () =>
      @uploadImpl(localPath, path, callback);

    @connectPromise().then(successCallback, callback);

  uploadImpl: (localPath, path, callback) ->
