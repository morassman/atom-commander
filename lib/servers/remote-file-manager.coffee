fse = require 'fs-extra'
PathUtil = require 'path'
{File} = require 'atom'
Watcher = require './watcher'

module.exports =
class RemoteFileManager

  constructor: (@server) ->
    @watchers = [];

  openFile: (file) ->
    serverPath = @server.getLocalDirectoryPath();
    cachePath = PathUtil.join(serverPath, "cache");
    localFilePath = PathUtil.join(cachePath, file.getPath());

    pane = atom.workspace.paneForURI(localFilePath);

    if pane?
      pane.activateItemForURI(localFilePath);
      return;

    fse.ensureDirSync(PathUtil.dirname(localFilePath));

    file.download localFilePath, (err) =>
      if err?
        @handleDownloadError(file, err);
      else
        atom.workspace.open(localFilePath).then (textEditor) =>
          @addWatcher(cachePath, localFilePath, file, textEditor);

  handleDownloadError: (file, err) ->
    message = "The file "+file.getPath()+" could not be downloaded."

    if err.message?
      message += "\nReason : "+err.message;

    options = {};
    options["dismissable"] = true;
    options["detail"] = message;
    atom.notifications.addWarning("Unable to download file.", options);

  addWatcher: (cachePath, localFilePath, file, textEditor) ->
    @watchers.push(new Watcher(@, cachePath, localFilePath, file, textEditor));

  removeWatcher: (watcher) ->
    watcher.destroy();
    index = @watchers.indexOf(watcher);

    if (index >= 0)
      @watchers.splice(index, 1);

  getOpenFileCount: ->
    return @watchers.length;

  destroy: ->
    for watcher in @watchers
      watcher.destroy();
