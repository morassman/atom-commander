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
    @client = null;

    if @config.password? and !@config.passwordDecrypted?
      @config.password = Utils.decrypt(@config.password, @getDescription());
      @config.passwordDecrypted = true;

    @clientConfig = @getClientConfig();

  isLocal: ->
    return false;

  connectImpl: ->
    if @clientConfig.password?
      @connectWithPassword(@clientConfig.password);
    else
      prompt = "Enter password for ";
      prompt += @clientConfig.username;
      prompt += "@";
      prompt += @clientConfig.host;
      prompt += ":"

      Utils.promptForPassword prompt, (password) =>
        if password?
          @connectWithPassword(password);
        else
          err = {};
          err.canceled = true;
          err.message = "Incorrect credentials for "+@clientConfig.host;
          @disconnect(err);

  connectWithPassword: (password) ->
    @client = null;
    @ssh2 = new SSH2();

    @ssh2.on "ready", =>
      @ssh2.sftp (err, sftp) =>
        console.log(err);

        if err?
          @disconnect(err);
          return;

        @client = sftp;

        @client.on "end", =>
          @disconnect();

        # If the connection was successful then remember the password for
        # the rest of the session.
        @clientConfig.password = password;

        if @config.storePassword
          @config.password = password;
          @config.passwordDecrypted = true;

        @setConnected(true);

    @ssh2.on "close", =>
      @disconnect();

    @ssh2.on "error", (err) =>
      if err.level == "client-authentication"
        delete @clientConfig.password;
        atom.notifications.addWarning("Incorrect credentials for "+@clientConfig.host);
        @connectImpl();
      else
        @disconnect(err);

    @ssh2.on "end", =>
      @disconnect();

    @ssh2.on "keyboard-interactive", (name, instructions, instructionsLang, prompt, finish) =>
      finish([password]);

    connectConfig = {};

    for key, val of @clientConfig
      connectConfig[key] = val;

    connectConfig.password = password;

    @ssh2.connect(connectConfig);

  disconnectImpl: ->
    if @client?
      @client.end();
      @client = null;

    if @ssh2?
      @ssh2.end();
      @ssh2 = null;

    @setConnected(false);

  getClientConfig: ->
    result = {};

    result.host = @config.host;
    result.port = @config.port;
    result.username = @config.username;
    result.password = @config.password;
    result.tryKeyboard = true;
    result.keepaliveInterval = 60000;

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

  renameImpl: (oldPath, newPath, callback) ->
    @client.rename oldPath, newPath, (err) =>
      if !callback?
        return;

      if err?
        callback(err.message);
      else
        callback(null);

  makeDirectoryImpl: (path, callback) ->
    @client.mkdir path, [], (err) =>
      if !callback?
        return;

      if err?
        callback(err.message);
      else
        callback(null);

  deleteFileImpl: (path, callback) ->
    @client.unlink path, (err) =>
      if !callback?
        return;

      if err?
        callback(err.message);
      else
        callback(null);

  deleteDirectoryImpl: (path, callback) ->
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
    return @config.protocol+"_"+@config.host+"_"+@config.port+"_"+@config.username;

  downloadImpl: (path, localPath, callback) ->
    @client.fastGet(path, localPath, {}, callback);

  uploadImpl: (localPath, path, callback) ->
    @client.fastPut(localPath, path, {}, callback);

  openFile: (file) ->
    @server.getRemoteFileManager().openFile(file);

  createReadStreamImpl: (path, callback) ->
    rs = @client.createReadStream(path);
    callback(null, rs);

  getDescription: ->
    return @config.protocol+"://"+@config.host+":"+@config.port;

  getEntriesImpl: (directory, callback) ->
    @list directory.getPath(), (err, entries) =>
      callback(directory, err, entries);

  list: (path, callback) ->
    @client.readdir path, (err, entries) =>
      if err?
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
      return new FTPDirectory(@, false, PathUtil.join(path, entry.filename));
    else if entry.attrs.isFile()
      return new FTPFile(@, false, PathUtil.join(path, entry.filename));
    # else if entry.attrs.isSymbolicLink()
      # TODO : Support symbolic links.

    return null;

  newFileImpl: (path, callback) ->
    @client.open path, "w", {}, (err, handle) =>
      if err?
        callback(null);
        return;

      @client.close handle, (err) =>
        if err?
          callback(null);
          return;

        callback(@getFile(path));
