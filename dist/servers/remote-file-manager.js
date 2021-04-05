/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var RemoteFileManager;
var fsp = require('fs-plus');
var fse = require('fs-extra');
var PathUtil = require('path');
var Watcher = require('./watcher');
var _a = require('atom'), CompositeDisposable = _a.CompositeDisposable, Directory = _a.Directory, File = _a.File;
module.exports =
    (RemoteFileManager = /** @class */ (function () {
        function RemoteFileManager(server) {
            var _this = this;
            this.server = server;
            this.watchers = [];
            this.disposables = new CompositeDisposable();
            this.disposables.add(atom.workspace.observeTextEditors(function (textEditor) {
                return _this.textEditorAdded(textEditor);
            }));
        }
        RemoteFileManager.prototype.getServer = function () {
            return this.server;
        };
        RemoteFileManager.prototype.textEditorAdded = function (textEditor) {
            var cachePath = this.server.getCachePath();
            var localFilePath = textEditor.getPath();
            var dir = new Directory(cachePath);
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
            var fileSystem = this.server.getFileSystem();
            var remotePath = dir.relativize(localFilePath);
            remotePath = remotePath.split("\\").join("/");
            var file = fileSystem.getFile("/" + remotePath);
            var watcher = this.addWatcher(cachePath, localFilePath, file, textEditor);
            return watcher.setOpenedRemotely(false);
        };
        RemoteFileManager.prototype.openFile = function (file) {
            var cachePath = this.server.getCachePath();
            var localFilePath = PathUtil.join(cachePath, file.getPath());
            var pane = atom.workspace.paneForURI(localFilePath);
            if (pane != null) {
                pane.activateItemForURI(localFilePath);
                return;
            }
            // See if the file is already in the cache.
            if (fsp.isFileSync(localFilePath)) {
                var message = "The file " + file.getURI() + " is already in the cache. ";
                message += "Opening the remote file will replace the one in the cache.\n";
                message += "Would you like to open the cached file instead?";
                var response = atom.confirm({
                    message: "Open cached file",
                    detailedMessage: message,
                    buttons: ["Cancel", "No", "Yes"]
                });
                if (response === 1) {
                    return this.downloadAndOpen(file, cachePath, localFilePath);
                }
                else if (response === 2) {
                    return atom.workspace.open(localFilePath);
                }
            }
            else {
                return this.downloadAndOpen(file, cachePath, localFilePath);
            }
        };
        RemoteFileManager.prototype.downloadAndOpen = function (file, cachePath, localFilePath) {
            var _this = this;
            fse.ensureDirSync(PathUtil.dirname(localFilePath));
            return file.download(localFilePath, function (err) {
                if (err != null) {
                    _this.handleDownloadError(file, err);
                    return;
                }
                return atom.workspace.open(localFilePath).then(function (textEditor) {
                    var watcher = _this.getWatcherWithLocalFilePath(localFilePath);
                    if (watcher === null) {
                        watcher = _this.addWatcher(cachePath, localFilePath, file, textEditor);
                    }
                    watcher.setOpenedRemotely(true);
                    return _this.server.getFileSystem().fileOpened(file);
                });
            });
        };
        RemoteFileManager.prototype.handleDownloadError = function (file, err) {
            var message = "The file " + file.getPath() + " could not be downloaded.";
            if (err.message != null) {
                message += "\nReason : " + err.message;
            }
            var options = {};
            options["dismissable"] = true;
            options["detail"] = message;
            return atom.notifications.addWarning("Unable to download file.", options);
        };
        RemoteFileManager.prototype.getWatcherWithLocalFilePath = function (localFilePath) {
            for (var _i = 0, _a = Array.from(this.watchers); _i < _a.length; _i++) {
                var watcher = _a[_i];
                if (watcher.getLocalFilePath() === localFilePath) {
                    return watcher;
                }
            }
            return null;
        };
        RemoteFileManager.prototype.addWatcher = function (cachePath, localFilePath, file, textEditor) {
            var watcher = new Watcher(this, cachePath, localFilePath, file, textEditor);
            this.watchers.push(watcher);
            return watcher;
        };
        RemoteFileManager.prototype.removeWatcher = function (watcher) {
            watcher.destroy();
            var index = this.watchers.indexOf(watcher);
            if (index >= 0) {
                return this.watchers.splice(index, 1);
            }
        };
        RemoteFileManager.prototype.getOpenFileCount = function () {
            return this.watchers.length;
        };
        RemoteFileManager.prototype.destroy = function () {
            this.disposables.dispose();
            return Array.from(this.watchers).map(function (watcher) {
                return watcher.destroy();
            });
        };
        return RemoteFileManager;
    }()));
//# sourceMappingURL=remote-file-manager.js.map