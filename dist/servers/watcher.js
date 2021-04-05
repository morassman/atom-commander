/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var Watcher;
var fs = require('fs');
var fsp = require('fs-plus');
var CompositeDisposable = require('atom').CompositeDisposable;
module.exports =
    (Watcher = /** @class */ (function () {
        function Watcher(remoteFileManager, cachePath, localFilePath, file, textEditor) {
            var _this = this;
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
            this.disposables.add(this.textEditor.onDidSave(function (event) {
                return _this.fileSaved();
            }));
            this.disposables.add(this.textEditor.onDidDestroy(function () {
                _this.destroyed = true;
                if (_this.uploading === 0) {
                    return _this.removeWatcher();
                }
            }));
        }
        Watcher.prototype.setOpenedRemotely = function (openedRemotely) {
            this.openedRemotely = openedRemotely;
        };
        Watcher.prototype.getFile = function () {
            return this.file;
        };
        Watcher.prototype.getLocalFilePath = function () {
            return this.localFilePath;
        };
        Watcher.prototype.getModifiedTime = function () {
            var stat = fs.statSync(this.localFilePath);
            return stat.mtime.getTime();
        };
        Watcher.prototype.fileSaved = function () {
            this.saveTime = this.getModifiedTime();
            if (atom.config.get("atom-commander.uploadOnSave")) {
                return this.upload();
            }
        };
        Watcher.prototype.upload = function () {
            var _this = this;
            this.uploading++;
            return this.file.upload(this.localFilePath, function (err) {
                _this.uploading--;
                return _this.uploadCallback(err);
            });
        };
        Watcher.prototype.uploadCallback = function (err) {
            this.uploadFailed = (err != null);
            if (this.uploadFailed) {
                var message = this.file.getPath() + " could not be uploaded to " + this.serverName;
                if (err.message != null) {
                    message += "\nReason : " + err.message;
                }
                message += "\nThe file has been cached and can be uploaded later.";
                var options = {};
                options["dismissable"] = true;
                options["detail"] = message;
                atom.notifications.addWarning("Unable to upload file.", options);
            }
            else {
                atom.notifications.addSuccess(this.file.getPath() + " uploaded to " + this.serverName);
                this.uploadTime = this.getModifiedTime();
            }
            if (this.destroyed) {
                return this.removeWatcher();
            }
        };
        Watcher.prototype.removeWatcher = function () {
            if (this.shouldDeleteFile()) {
                fsp.removeSync(this.localFilePath);
            }
            return this.remoteFileManager.removeWatcher(this);
        };
        Watcher.prototype.shouldDeleteFile = function () {
            var removeOnClose = atom.config.get("atom-commander.removeOnClose");
            if (!removeOnClose) {
                return false;
            }
            if (this.openedRemotely) {
                return this.shouldDeleteRemoteOpenedFile();
            }
            return this.shouldDeleteLocalOpenedFile();
        };
        Watcher.prototype.shouldDeleteRemoteOpenedFile = function () {
            if (this.saveTime === null) {
                return true;
            }
            if (this.uploadTime === null) {
                return false;
            }
            return this.uploadTime === this.saveTime;
        };
        Watcher.prototype.shouldDeleteLocalOpenedFile = function () {
            if (this.uploadTime === null) {
                return false;
            }
            if (this.saveTime === null) {
                return this.uploadTime === this.openTime;
            }
            return this.uploadTime === this.saveTime;
        };
        Watcher.prototype.destroy = function () {
            return this.disposables.dispose();
        };
        return Watcher;
    }()));
//# sourceMappingURL=watcher.js.map