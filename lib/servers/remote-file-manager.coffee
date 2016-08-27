fsp = require 'fs-plus'
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

  getServer: ->
    return @server;

  textEditorAdded: (textEditor) ->
    cachePath = @server.getCachePath();
    localFilePath = textEditor.getPath();
    dir = new Directory(cachePath);

    # Check to see if the file is in the cache directory.
    if !dir.contains(localFilePath)
      return;

    # Ensure that the file exists. An editor can exist for a file path if Atom
    # was closed with the file open, but then the file was deleted before Atom
    # was launched again.
    if !fsp.isFileSync(localFilePath)
      return;

    # See if the file is already being watched. This will be the case if the
    # file was opened directly from the remote file system instead of locally.
    if @getWatcherWithLocalFilePath(localFilePath) != null
      return;

    fileSystem = @server.getFileSystem();
    remotePath = dir.relativize(localFilePath);
    remotePath = remotePath.split("\\").join("/");
    file = fileSystem.getFile("/"+remotePath);
    watcher = @addWatcher(cachePath, localFilePath, file, textEditor);
    watcher.setOpenedRemotely(false);

  openFile: (file) ->
    cachePath = @server.getCachePath();
    localFilePath = PathUtil.join(cachePath, file.getPath());

    pane = atom.workspace.paneForURI(localFilePath);

    if pane?
      pane.activateItemForURI(localFilePath);
      return;

    # See if the file is already in the cache.
    if fsp.isFileSync(localFilePath)
      message = "The file "+file.getURI()+" is already in the cache. ";
      message += "Opening the remote file will replace the one in the cache.\n";
      message += "Would you like to open the cached file instead?";

      option = atom.confirm
        message: "Open cached file"
        detailedMessage: message
        buttons: ["Cancel", "No", "Yes"]

      if option == 0
        return;
      else if option == 2
        atom.workspace.open(localFilePath);
        return;

    @downloadAndOpen(file, cachePath, localFilePath);

  downloadAndOpen: (file, cachePath, localFilePath) ->
    fse.ensureDirSync(PathUtil.dirname(localFilePath));

    file.download localFilePath, (err) =>
      if err?
        @handleDownloadError(file, err);
        return;

      atom.workspace.open(localFilePath).then (textEditor) =>
        watcher = @getWatcherWithLocalFilePath(localFilePath);

        if watcher == null
          watcher = @addWatcher(cachePath, localFilePath, file, textEditor);

        watcher.setOpenedRemotely(true);
        @server.getFileSystem().fileOpened(file);

  handleDownloadError: (file, err) ->
    message = "The file "+file.getPath()+" could not be downloaded."

    if err.message?
      message += "\nReason : "+err.message;

    options = {};
    options["dismissable"] = true;
    options["detail"] = message;
    atom.notifications.addWarning("Unable to download file.", options);

  getWatcherWithLocalFilePath: (localFilePath) ->
    for watcher in @watchers
      if watcher.getLocalFilePath() == localFilePath
        return watcher;

    return null;

  addWatcher: (cachePath, localFilePath, file, textEditor) ->
    watcher = new Watcher(@, cachePath, localFilePath, file, textEditor);
    @watchers.push(watcher);
    return watcher;

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
