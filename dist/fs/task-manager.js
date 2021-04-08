"use strict";
exports.__esModule = true;
exports.TaskManager = void 0;
var atom_1 = require("atom");
var queue_1 = require("queue");
var PathUtil = require('path');
var fse = require('fs-extra');
var fs = require('fs');
var Utils = require('../utils');
var TaskManager = /** @class */ (function () {
    function TaskManager(fileSystem) {
        var _this = this;
        this.fileSystem = fileSystem;
        this.emitter = new atom_1.Emitter();
        this.uploadCount = 0;
        this.downloadCount = 0;
        this.taskQueue = new queue_1["default"]();
        this.taskQueue.concurrency = 1;
        this.disposables = new atom_1.CompositeDisposable();
        this.taskQueue.on('success', function (result, job) {
            return _this.jobEnded(job, false, null);
        });
        this.taskQueue.on('error', function (err, job) {
            if (err.canceled) {
                _this.jobEnded(job, true, err);
                return _this.taskQueue.end(err);
            }
            else {
                return _this.jobEnded(job, false, err);
            }
        });
        this.taskQueue.on('end', function (err) {
            _this.setUploadCount(0);
            _this.setDownloadCount(0);
            if (_this.emitter !== null) {
                return _this.emitter.emit('end', err);
            }
        });
        this.disposables.add(this.fileSystem.onError(function (err) {
            if (_this.taskQueue.length === 0) {
                return;
            }
            if (err != null) {
                Utils.showErrorWarning('Transfer failed', null, null, err, true);
            }
            return _this.taskQueue.end(err);
        }));
    }
    TaskManager.prototype.onUploadCount = function (callback) {
        if (this.emitter) {
            this.emitter.on('uploadcount', callback);
        }
    };
    TaskManager.prototype.onDownloadCount = function (callback) {
        if (this.emitter) {
            this.emitter.on('downloadcount', callback);
        }
    };
    TaskManager.prototype.onEnd = function (callback) {
        if (this.emitter) {
            this.emitter.on('end', callback);
        }
    };
    TaskManager.prototype.jobEnded = function (job, canceled, err) {
        if (job.upload) {
            this.adjustUploadCount(-1);
        }
        else if (job.download) {
            this.adjustDownloadCount(-1);
        }
        return (typeof job.callback === 'function' ? job.callback(canceled, err, job.item) : undefined);
    };
    TaskManager.prototype.adjustUploadCount = function (diff) {
        return this.setUploadCount(this.uploadCount + diff);
    };
    TaskManager.prototype.adjustDownloadCount = function (diff) {
        return this.setDownloadCount(this.downloadCount + diff);
    };
    TaskManager.prototype.setUploadCount = function (uploadCount) {
        var old = this.uploadCount;
        this.uploadCount = uploadCount;
        if (this.emitter !== null) {
            return this.emitter.emit('uploadcount', [old, this.uploadCount]);
        }
    };
    TaskManager.prototype.setDownloadCount = function (downloadCount) {
        var old = this.downloadCount;
        this.downloadCount = downloadCount;
        if (this.emitter !== null) {
            return this.emitter.emit('downloadcount', [old, this.downloadCount]);
        }
    };
    TaskManager.prototype.clearTasks = function () {
        return this.taskQueue.end();
    };
    TaskManager.prototype.dispose = function () {
        this.taskQueue.end();
        return this.fileSystem.disconnect();
    };
    TaskManager.prototype.getFileSystem = function () {
        return this.fileSystem;
    };
    TaskManager.prototype.getTaskCount = function () {
        return this.taskQueue.length;
    };
    // callback receives two parameters:
    // 1.) err - null if there was no error.
    // 2.) item - The item that was uploaded.
    TaskManager.prototype.uploadItem = function (remoteParentPath, item, callback) {
        return this.uploadItems(remoteParentPath, [item], callback);
    };
    TaskManager.prototype.uploadItems = function (remoteParentPath, items, callback) {
        this.uploadItemsWithQueue(remoteParentPath, items, callback);
        return this.taskQueue.start();
    };
    TaskManager.prototype.uploadItemsWithQueue = function (remoteParentPath, items, callback) {
        for (var _i = 0, _a = Array.from(items); _i < _a.length; _i++) {
            var item = _a[_i];
            if (!item.isLink()) {
                if (item.isFile()) {
                    this.uploadFileWithQueue(remoteParentPath, item, callback);
                }
                else {
                    this.uploadDirectoryWithQueue(remoteParentPath, item, callback);
                }
            }
        }
    };
    TaskManager.prototype.uploadFileWithQueue = function (remoteParentPath, file, callback) {
        var _this = this;
        var remoteFilePath = PathUtil.posix.join(remoteParentPath, file.getBaseName());
        var task = function (cb) {
            return _this.fileSystem.upload(file.getPath(), remoteFilePath, cb);
        };
        return this.addUploadTask(task, file, callback);
    };
    TaskManager.prototype.uploadDirectoryWithQueue = function (remoteParentPath, directory, callback) {
        var _this = this;
        var remoteFolderPath = PathUtil.posix.join(remoteParentPath, directory.getBaseName());
        var task1 = function (cb) {
            _this.fileSystem.makeDirectory(remoteFolderPath, cb);
        };
        this.addUploadTask(task1, directory, callback);
        var task2 = function (cb) {
            return directory.getEntries(function (dir, err, entries) {
                if (err != null) {
                    return cb(err);
                }
                else {
                    _this.uploadItemsWithQueue(remoteFolderPath, entries);
                    return cb();
                }
            });
        };
        return this.addUploadTask(task2, directory, callback);
    };
    // callback receives two parameters:
    // 1.) err - null if there was no error.
    // 2.) item - The item that was downloaded.
    TaskManager.prototype.downloadItem = function (localParentPath, item, callback) {
        return this.downloadItems(localParentPath, [item], callback);
    };
    TaskManager.prototype.downloadItems = function (localParentPath, items, callback) {
        this.downloadItemsWithQueue(localParentPath, items, callback);
        return this.taskQueue.start();
    };
    TaskManager.prototype.downloadItemsWithQueue = function (localParentPath, items, callback) {
        var _this = this;
        return (function () {
            var result = [];
            for (var _i = 0, _a = Array.from(items); _i < _a.length; _i++) {
                var item = _a[_i];
                if (!item.isLink()) {
                    if (item.isFile()) {
                        result.push(_this.downloadFileWithQueue(localParentPath, item, callback));
                    }
                    else {
                        result.push(_this.downloadDirectoryWithQueue(localParentPath, item, callback));
                    }
                }
                else {
                    result.push(undefined);
                }
            }
            return result;
        })();
    };
    TaskManager.prototype.downloadFileWithQueue = function (localParentPath, file, callback) {
        var localFilePath = PathUtil.join(localParentPath, file.getBaseName());
        var task = function (cb) {
            return file.download(localFilePath, cb);
        };
        return this.addDownloadTask(task, file, callback);
    };
    TaskManager.prototype.downloadDirectoryWithQueue = function (localParentPath, directory, callback) {
        var _this = this;
        var localFolderPath = PathUtil.join(localParentPath, directory.getBaseName());
        var task1 = function (cb) {
            fse.ensureDirSync(localFolderPath);
            cb(null);
        };
        this.addDownloadTask(task1, directory, callback);
        var task2 = function (cb) {
            return directory.getEntries(function (dir, err, entries) {
                if (err != null) {
                    return cb(err);
                }
                else {
                    _this.downloadItemsWithQueue(localFolderPath, entries, callback);
                    return cb(null);
                }
            });
        };
        return this.addDownloadTask(task2, directory, callback);
    };
    TaskManager.prototype.addUploadTask = function (task, item, callback) {
        task.upload = true;
        task.item = item;
        task.callback = callback;
        this.adjustUploadCount(1);
        return this.taskQueue.push(task);
    };
    TaskManager.prototype.addDownloadTask = function (task, item, callback) {
        task.download = true;
        task.item = item;
        task.callback = callback;
        this.adjustDownloadCount(1);
        return this.taskQueue.push(task);
    };
    return TaskManager;
}());
exports.TaskManager = TaskManager;
//# sourceMappingURL=task-manager.js.map