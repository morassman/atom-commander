fse = require 'fs-extra'
PathUtil = require 'path'
Watcher = require './watcher'
{CompositeDisposable, Directory, File} = require 'atom'

module.exports =
class RemoteFileManager

  constructor: (@server) ->
    @watchers = [];
    @disposables = new CompositeDisposable();
    @disposables.add atom.workspace.observeTextEditors (textEditor) =>
      @textEditorAdded(textEditor);

  textEditorAdded: (textEditor) ->
    cachePath = @server.getCachePath();
    localFilePath = textEditor.getPath();
    dir = new Directory(cachePath);

    if !dir.contains(localFilePath)
      return;

    fileSystem = @server.getFileSystem();
    file = fileSystem.getFile("/"+dir.relativize(localFilePath));
    @addWatcher(cachePath, localFilePath, file, textEditor);

  openFile: (file) ->
    cachePath = @server.getCachePath();
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
        atom.workspace.open(localFilePath);

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
    @disposables.dispose();

    for watcher in @watchers
      watcher.destroy();
