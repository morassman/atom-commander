fs = require 'fs'
fsp = require 'fs-plus'
PathUtil = require('path').posix
VFileSystem = require '../vfilesystem'
FTPFile = require './ftp-file'
FTPDirectory = require './ftp-directory'
FTPSymLink = require './ftp-symlink'
SFTPSession = require './sftp-session'
Utils = require '../../utils'

module.exports =
class SFTPFileSystem extends VFileSystem

  constructor: (@server, @config) ->
    super(@server.getMain());
    @session = null;
    @client = null;

    if !@config.passwordDecrypted
      if @config.loginWithPassword
        @config.password = Utils.decrypt(@config.password, @getDescription());
      else
        @config.passphrase = Utils.decrypt(@config.passphrase, @getDescription());
      @config.passwordDecrypted = true;

    @clientConfig = @getClientConfig();

  clone: ->
    cloneFS = new SFTPFileSystem(@server, @config);
    cloneFS.clientConfig = @clientConfig;
    return cloneFS;

  isLocal: ->
    return false;

  connectImpl: ->
    @session = new SFTPSession(@);
    @session.connect();

  disconnectImpl: ->
    if @session?
      @session.disconnect();

  sessionOpened: (session) ->
    if session == @session
      @client = session.getClient();
      @setConnected(true);

  sessionCanceled: (session) ->
    if session == @session
      @session = null;
      @setConnected(false);

  sessionClosed: (session) ->
    if session == @session
      @session = null;
      @client = null;
      @setConnected(false);

  getClientConfig: ->
    result = {};

    result.host = @config.host;
    result.port = @config.port;
    result.username = @config.username;
    result.password = @config.password;
    result.passphrase = @config.passphrase;
    result.privateKey = @getPrivateKey(@config.privateKeyPath);
    result.tryKeyboard = true;
    result.keepaliveInterval = 60000;

    return result;

  getPrivateKey: (path) ->
    if !path or path.length == 0
      return '';

    path = Utils.resolveHome(path);

    if !fsp.isFileSync(path)
      return '';

    return fs.readFileSync(path, 'utf8');

  getSafeConfig: ->
    result = {};

    for key, val of @config
      result[key] = val;

    if @config.storePassword
      if @config.loginWithPassword
        result.password = Utils.encrypt(result.password, @getDescription());
      else if @config.usePassphrase
        result.passphrase = Utils.encrypt(result.passphrase, @getDescription());
    else
      delete result.password;
      delete result.passphrase;

    delete result.privateKey;
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

  getPathUtil: ->
    return PathUtil;

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
        callback(err);
      else
        callback(null);

  makeDirectoryImpl: (path, callback) ->
    @client.mkdir path, [], (err) =>
      if !callback?
        return;

      if err?
        callback(err);
      else
        callback(null);

  deleteFileImpl: (path, callback) ->
    @client.unlink path, (err) =>
      if !callback?
        return;

      if err?
        callback(err);
      else
        callback(null);

  deleteDirectoryImpl: (path, callback) ->
    @client.rmdir path, (err) =>
      if !callback?
        return;

      if err?
        callback(err);
      else
        callback(null);

  getName: ->
    return @config.host;

  getUsername: ->
    return @config.username;

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
    item = null;

    if entry.attrs.isDirectory()
      item = new FTPDirectory(@, false, PathUtil.join(path, entry.filename));
    else if entry.attrs.isFile()
      item = new FTPFile(@, false, PathUtil.join(path, entry.filename));
    else if entry.attrs.isSymbolicLink()
      item = @wrapSymLinkEntry(path, entry);

    if item?
      item.modifyDate = new Date(entry.attrs.mtime*1000);
      item.size = entry.attrs.size;

    return item;

  wrapSymLinkEntry: (path, entry) ->
    fullPath = PathUtil.join(path, entry.filename);
    result = new FTPSymLink(@, fullPath);
    @client.stat fullPath, (err, stat) =>
      if err?
        return;

      result.setModifyDate(new Date(entry.attrs.mtime*1000));
      result.setSize(entry.attrs.size);

      @client.readlink fullPath, (err, target) =>
        if err?
          return;

        if stat.isFile()
          result.setTargetFilePath(target);
        else if stat.isDirectory()
          result.setTargetDirectoryPath(PathUtil.join(path, target));

    return result;

  newFileImpl: (path, callback) ->
    @client.open path, "w", {}, (err, handle) =>
      if err?
        callback(null, err);
        return;

      @client.close handle, (err) =>
        if err?
          callback(null, err);
          return;

        callback(@getFile(path), null);
