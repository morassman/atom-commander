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
    @client = null;

    if @config.password? and !@config.passwordDecrypted?
      @config.password = Utils.decrypt(@config.password, @getDescription());
      @config.passwordDecrypted = true;

    @clientConfig = @getClientConfig();

  isLocal: ->
    return false;

  connect: ->
    if @clientConfig.password?
      @connectWithPassword(@clientConfig.password);
    else
      Utils.promptForPassword "Enter password:", (password) =>
        if password?
          @connectWithPassword(password);

  connectWithPassword: (password) ->
    @client = new FTPClient();

    @client.on "ready", =>
      @clientConfig.password = password;
      @setConnected(true);

    @client.on "close", =>
      @setConnected(false);

    @client.on "error", (err) =>
      message = "Error connecting to "+@getDescription()+".";
      if err.message?
        message += "\n"+err.message;

      atom.notifications.addWarning(message);
      console.log(err);

    @client.on "end", =>
      @setConnected(false);

    connectConfig = {};

    for key, val of @clientConfig
      connectConfig[key] = val;

    connectConfig.password = password;

    @client.connect(connectConfig);

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

  getClientConfig: ->
    result = {};

    result.host = @config.host;
    result.port = @config.port;
    result.user = @config.user;
    result.password = @config.password;

    return result;

  getSafeConfig: ->
    result = {};

    for key, val of @config
      result[key] = val;

    if @config.storePassword
      result.password = Utils.encrypt(result.password, @getDescription());
    else
      delete result.password;

    delete result.passwordDecrypted;

    return result;

  getFile: (path) ->
    return new FTPFile(@, false, path);

  getDirectory: (path) ->
    return new FTPDirectory(@, false, path);

  getItemWithPathDescription: (pathDescription) ->
    if pathDescription.isFile
      return new FTPFile(@, pathDescription.isLink, pathDescription.path, pathDescription.name);

    return new FTPDirectory(@, pathDescription.isLink, pathDescription.path);

  getInitialDirectory: ->
    return @getDirectory(@config.folder);

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

  getID: ->
    return @getLocalDirectoryName();

  getLocalDirectoryName: ->
    return @config.protocol+"_"+@config.host+"_"+@config.port+"_"+@config.user;

  download: (path, localPath, callback) ->
    @client.get path, (err, stream) =>
      if !err?
        stream.pipe(fs.createWriteStream(localPath));
      callback(err);

  upload: (localPath, path, callback) ->
    @client.put(localPath, path, false, callback);

  openFile: (file) ->
    @server.openFile(file);

  createReadStream: (path, callback) ->
    @client.get(path, callback);

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
