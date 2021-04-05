/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let RemoteFileManager;
const fsp = require('fs-plus');
const fse = require('fs-extra');
const PathUtil = require('path');
const Watcher = require('./watcher');
const {CompositeDisposable, Directory, File} = require('atom');

module.exports =
(RemoteFileManager = class RemoteFileManager {

  constructor(server) {
    this.server = server;
    this.watchers = [];
    this.disposables = new CompositeDisposable();
    this.disposables.add(atom.workspace.observeTextEditors(textEditor => {
      return this.textEditorAdded(textEditor);
    })
    );
  }

  getServer() {
    return this.server;
  }

  textEditorAdded(textEditor) {
    const cachePath = this.server.getCachePath();
    const localFilePath = textEditor.getPath();
    const dir = new Directory(cachePath);

    // Check to see if the file is in the cache directory.
    if (!dir.contains(localFilePath)) {
      return;
    }

    // Ensure that the file exists. An editor can exist for a file path if Atom
    // was closed with the file open, but then the file was deleted before Atom
    // was launched again.
    if (!fsp.isFileSync(localFilePath)) {
      return;
    }

    // See if the file is already being watched. This will be the case if the
    // file was opened directly from the remote file system instead of locally.
    if (this.getWatcherWithLocalFilePath(localFilePath) !== null) {
      return;
    }

    const fileSystem = this.server.getFileSystem();
    let remotePath = dir.relativize(localFilePath);
    remotePath = remotePath.split("\\").join("/");
    const file = fileSystem.getFile("/"+remotePath);
    const watcher = this.addWatcher(cachePath, localFilePath, file, textEditor);
    return watcher.setOpenedRemotely(false);
  }

  openFile(file) {
    const cachePath = this.server.getCachePath();
    const localFilePath = PathUtil.join(cachePath, file.getPath());

    const pane = atom.workspace.paneForURI(localFilePath);

    if (pane != null) {
      pane.activateItemForURI(localFilePath);
      return;
    }

    // See if the file is already in the cache.
    if (fsp.isFileSync(localFilePath)) {
      let message = "The file "+file.getURI()+" is already in the cache. ";
      message += "Opening the remote file will replace the one in the cache.\n";
      message += "Would you like to open the cached file instead?";

      const response = atom.confirm({
        message: "Open cached file",
        detailedMessage: message,
        buttons: ["Cancel", "No", "Yes"]});

      if (response === 1) {
        return this.downloadAndOpen(file, cachePath, localFilePath);
      } else if (response === 2) {
        return atom.workspace.open(localFilePath);
      }
    } else {
      return this.downloadAndOpen(file, cachePath, localFilePath);
    }
  }

  downloadAndOpen(file, cachePath, localFilePath) {
    fse.ensureDirSync(PathUtil.dirname(localFilePath));

    return file.download(localFilePath, err => {
      if (err != null) {
        this.handleDownloadError(file, err);
        return;
      }

      return atom.workspace.open(localFilePath).then(textEditor => {
        let watcher = this.getWatcherWithLocalFilePath(localFilePath);

        if (watcher === null) {
          watcher = this.addWatcher(cachePath, localFilePath, file, textEditor);
        }

        watcher.setOpenedRemotely(true);
        return this.server.getFileSystem().fileOpened(file);
      });
    });
  }

  handleDownloadError(file, err) {
    let message = "The file "+file.getPath()+" could not be downloaded.";

    if (err.message != null) {
      message += "\nReason : "+err.message;
    }

    const options = {};
    options["dismissable"] = true;
    options["detail"] = message;
    return atom.notifications.addWarning("Unable to download file.", options);
  }

  getWatcherWithLocalFilePath(localFilePath) {
    for (let watcher of Array.from(this.watchers)) {
      if (watcher.getLocalFilePath() === localFilePath) {
        return watcher;
      }
    }

    return null;
  }

  addWatcher(cachePath, localFilePath, file, textEditor) {
    const watcher = new Watcher(this, cachePath, localFilePath, file, textEditor);
    this.watchers.push(watcher);
    return watcher;
  }

  removeWatcher(watcher) {
    watcher.destroy();
    const index = this.watchers.indexOf(watcher);

    if (index >= 0) {
      return this.watchers.splice(index, 1);
    }
  }

  getOpenFileCount() {
    return this.watchers.length;
  }

  destroy() {
    this.disposables.dispose();

    return Array.from(this.watchers).map((watcher) =>
      watcher.destroy());
  }
});
