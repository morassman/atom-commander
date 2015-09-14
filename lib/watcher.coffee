fsp = require 'fs-plus'
{CompositeDisposable} = require 'atom'

module.exports =
class Watcher

  constructor: (@remoteFileManager, @cachePath, @localFilePath, @file, @textEditor) ->
    @uploading = 0;
    @uploadFailed = false;
    @destroyed = false;
    @disposables = new CompositeDisposable();

    @disposables.add @textEditor.onDidSave (event) =>
      @uploading++;
      @file.upload @localFilePath, (err) =>
        @uploading--;
        @uploadCallback(err);

    @disposables.add @textEditor.onDidDestroy =>
      @destroyed = true;
      if @uploading == 0
        @removeWatcher();

  uploadCallback: (err) ->
    @uploadFailed = err?;

    if @uploadFailed
      message = "The file "+@file.getPath()+" could not be uploaded."

      if err.message?
        message += "\nReason : "+err.message;

      if @destroyed
        message += "\nThe file has been cached and can be uploaded later.";

      options = {};
      options["dismissable"] = true;
      options["detail"] = message;
      atom.notifications.addWarning("Unable to upload file.", options);

    if @destroyed
      @removeWatcher();

  removeWatcher: ->
    if !@uploadFailed
      fsp.removeSync(@localFilePath);

    @remoteFileManager.removeWatcher(@);

  destroy: ->
    @disposables.dispose();
