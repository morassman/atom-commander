fs = require 'fs'
fsp = require 'fs-plus'
{CompositeDisposable} = require 'atom'

module.exports =
class Watcher

  constructor: (@remoteFileManager, @cachePath, @localFilePath, @file, @textEditor) ->
    @uploading = 0;
    @changesSaved = false;
    @uploadFailed = false;
    @destroyed = false;
    @openedRemotely = true;
    @openTime = @getModifiedTime();
    @saveTime = null;
    @uploadTime = null;
    @disposables = new CompositeDisposable();
    @serverName = @remoteFileManager.getServer().getName();

    @disposables.add @textEditor.onDidSave (event) =>
      @fileSaved();

    @disposables.add @textEditor.onDidDestroy =>
      @destroyed = true;
      if @uploading == 0
        @removeWatcher();

  setOpenedRemotely: (@openedRemotely) ->

  getFile: ->
    return @file;

  getLocalFilePath: ->
    return @localFilePath;

  getModifiedTime: ->
    stat = fs.statSync(@localFilePath);
    return stat.mtime.getTime();

  fileSaved: ->
    @saveTime = @getModifiedTime();

    if atom.config.get("atom-commander.uploadOnSave")
      @upload();

  upload: ->
    @uploading++;
    @file.upload @localFilePath, (err) =>
      @uploading--;
      @uploadCallback(err);

  uploadCallback: (err) ->
    @uploadFailed = err?;

    if @uploadFailed
      message = @file.getPath()+" could not be uploaded to "+@serverName;

      if err.message?
        message += "\nReason : "+err.message;

      message += "\nThe file has been cached and can be uploaded later.";

      options = {};
      options["dismissable"] = true;
      options["detail"] = message;
      atom.notifications.addWarning("Unable to upload file.", options);
    else
      atom.notifications.addSuccess(@file.getPath()+" uploaded to "+@serverName);
      @uploadTime = @getModifiedTime();

    if @destroyed
      @removeWatcher();

  removeWatcher: ->
    if @shouldDeleteFile()
      fsp.removeSync(@localFilePath);

    @remoteFileManager.removeWatcher(@);

  shouldDeleteFile: ->
    removeOnClose = atom.config.get("atom-commander.removeOnClose");

    if !removeOnClose
      return false;

    if @openedRemotely
      return @shouldDeleteRemoteOpenedFile();

    return @shouldDeleteLocalOpenedFile();

  shouldDeleteRemoteOpenedFile: ->
    if @saveTime == null
      return true;

    if @uploadTime == null
      return false;

    return @uploadTime == @saveTime;

  shouldDeleteLocalOpenedFile: ->
    if @uploadTime == null
      return false;

    if @saveTime == null
      return @uploadTime == @openTime;

    return @uploadTime == @saveTime;

  destroy: ->
    @disposables.dispose();
