/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Watcher;
const fs = require('fs');
const fsp = require('fs-plus');
const {CompositeDisposable} = require('atom');

module.exports =
(Watcher = class Watcher {

  constructor(remoteFileManager, cachePath, localFilePath, file, textEditor) {
    this.remoteFileManager = remoteFileManager;
    this.cachePath = cachePath;
    this.localFilePath = localFilePath;
    this.file = file;
    this.textEditor = textEditor;
    this.uploading = 0;
    this.changesSaved = false;
    this.uploadFailed = false;
    this.destroyed = false;
    this.openedRemotely = true;
    this.openTime = this.getModifiedTime();
    this.saveTime = null;
    this.uploadTime = null;
    this.disposables = new CompositeDisposable();
    this.serverName = this.remoteFileManager.getServer().getDisplayName();

    this.disposables.add(this.textEditor.onDidSave(event => {
      return this.fileSaved();
    })
    );

    this.disposables.add(this.textEditor.onDidDestroy(() => {
      this.destroyed = true;
      if (this.uploading === 0) {
        return this.removeWatcher();
      }
    })
    );
  }

  setOpenedRemotely(openedRemotely) {
    this.openedRemotely = openedRemotely;
  }

  getFile() {
    return this.file;
  }

  getLocalFilePath() {
    return this.localFilePath;
  }

  getModifiedTime() {
    const stat = fs.statSync(this.localFilePath);
    return stat.mtime.getTime();
  }

  fileSaved() {
    this.saveTime = this.getModifiedTime();

    if (atom.config.get("atom-commander.uploadOnSave")) {
      return this.upload();
    }
  }

  upload() {
    this.uploading++;
    return this.file.upload(this.localFilePath, err => {
      this.uploading--;
      return this.uploadCallback(err);
    });
  }

  uploadCallback(err) {
    this.uploadFailed = (err != null);

    if (this.uploadFailed) {
      let message = this.file.getPath()+" could not be uploaded to "+this.serverName;

      if (err.message != null) {
        message += "\nReason : "+err.message;
      }

      message += "\nThe file has been cached and can be uploaded later.";

      const options = {};
      options["dismissable"] = true;
      options["detail"] = message;
      atom.notifications.addWarning("Unable to upload file.", options);
    } else {
      atom.notifications.addSuccess(this.file.getPath()+" uploaded to "+this.serverName);
      this.uploadTime = this.getModifiedTime();
    }

    if (this.destroyed) {
      return this.removeWatcher();
    }
  }

  removeWatcher() {
    if (this.shouldDeleteFile()) {
      fsp.removeSync(this.localFilePath);
    }

    return this.remoteFileManager.removeWatcher(this);
  }

  shouldDeleteFile() {
    const removeOnClose = atom.config.get("atom-commander.removeOnClose");

    if (!removeOnClose) {
      return false;
    }

    if (this.openedRemotely) {
      return this.shouldDeleteRemoteOpenedFile();
    }

    return this.shouldDeleteLocalOpenedFile();
  }

  shouldDeleteRemoteOpenedFile() {
    if (this.saveTime === null) {
      return true;
    }

    if (this.uploadTime === null) {
      return false;
    }

    return this.uploadTime === this.saveTime;
  }

  shouldDeleteLocalOpenedFile() {
    if (this.uploadTime === null) {
      return false;
    }

    if (this.saveTime === null) {
      return this.uploadTime === this.openTime;
    }

    return this.uploadTime === this.saveTime;
  }

  destroy() {
    return this.disposables.dispose();
  }
});
