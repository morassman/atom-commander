var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var CacheItemView;
var fsp = require('fs-plus');
var fse = require('fs-extra');
var _a = require('atom-space-pen-views'), $ = _a.$, $$ = _a.$$;
var PathUtil = require('path');
var Utils = require('../../utils');
var Buffer = require('../../buffer');
module.exports =
    (CacheItemView = /** @class */ (function (_super) {
        __extends(CacheItemView, _super);
        function CacheItemView() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        CacheItemView.prototype.initializeHeader = function (syncView) {
            this.syncView = syncView;
            this.initialize(true);
            return this.pathElement.textContent = "Selection";
        };
        CacheItemView.prototype.initializeRow = function (syncView, fullPath, path) {
            this.syncView = syncView;
            this.fullPath = fullPath;
            this.path = path;
            this.initialize(false);
            return this.pathElement.textContent = this.path;
        };
        CacheItemView.prototype.initialize = function (isHeader) {
            var _this = this;
            this.isHeader = isHeader;
            this.checkElement = document.createElement("td");
            this.pathElement = document.createElement("td");
            this.openElement = document.createElement("td");
            this.compareElement = document.createElement("td");
            this.uploadElement = document.createElement("td");
            this.downloadElement = document.createElement("td");
            this.deleteElement = document.createElement("td");
            this.statusElement = document.createElement("td");
            this.jcheck = $(this.checkElement);
            this.jpath = $(this.pathElement);
            this.jupload = $(this.uploadElement);
            this.jdownload = $(this.downloadElement);
            this.jdelete = $(this.deleteElement);
            this.jstatus = $(this.statusElement);
            this.jpath.css("padding-right", "32px");
            this.check = $$(function () {
                return this.input({ type: "checkbox" });
            });
            this.uploadButton = $$(function () {
                return this.button("Upload", { "class": "btn btn-sm" });
            });
            this.downloadButton = $$(function () {
                return this.button("Download", { "class": "btn btn-sm" });
            });
            this.deleteButton = $$(function () {
                return this.button("Remove", { "class": "btn btn-sm" });
            });
            this.check.change(function () { return _this.checkChanged(); });
            this.uploadButton.click(function () { return _this.upload(); });
            this.downloadButton.click(function () { return _this.download(); });
            this.deleteButton.click(function () { return _this.promptDelete(); });
            this.uploadButton.on('mousedown', function (e) { return e.preventDefault(); });
            this.downloadButton.on('mousedown', function (e) { return e.preventDefault(); });
            this.deleteButton.on('mousedown', function (e) { return e.preventDefault(); });
            this.jcheck.append(this.check);
            this.jupload.append(this.uploadButton);
            this.jdownload.append(this.downloadButton);
            this.jdelete.append(this.deleteButton);
            if (!this.isHeader) {
                this.jopen = $(this.openElement);
                this.openButton = $$(function () {
                    return this.button("Open", { "class": "btn btn-sm" });
                });
                this.openButton.click(function () { return _this.open(); });
                this.openButton.on('mousedown', function (e) { return e.preventDefault(); });
                this.jopen.append(this.openButton);
                this.jcompare = $(this.compareElement);
                this.compareButton = $$(function () {
                    return this.button("Compare", { "class": "btn btn-sm" });
                });
                this.compareButton.click(function () { return _this.compare(); });
                this.compareButton.on('mousedown', function (e) { return e.preventDefault(); });
                this.jcompare.append(this.compareButton);
            }
            this.appendChild(this.checkElement);
            this.appendChild(this.pathElement);
            this.appendChild(this.openElement);
            this.appendChild(this.compareElement);
            this.appendChild(this.uploadElement);
            this.appendChild(this.downloadElement);
            this.appendChild(this.deleteElement);
            this.appendChild(this.statusElement);
            return this.setTransferInProgress(false);
        };
        CacheItemView.prototype.setChecked = function (checked) {
            if (checked !== this.isChecked()) {
                return this.check.trigger("click");
            }
        };
        CacheItemView.prototype.checkChanged = function () {
            if (this.isHeader) {
                return this.syncView.setAllChecked(this.check.is(":checked"));
            }
        };
        CacheItemView.prototype.isChecked = function () {
            return this.check.is(":checked");
        };
        CacheItemView.prototype.open = function () {
            return atom.workspace.open(this.fullPath);
        };
        CacheItemView.prototype.upload = function () {
            var _this = this;
            if (this.isHeader) {
                this.syncView.uploadChecked();
                return;
            }
            if (this.transferInProgress) {
                return;
            }
            this.setTransferInProgress(true);
            if (!fsp.isFileSync(this.fullPath)) {
                this.showStatus("Cached file could not be found.", 2);
                this.setTransferInProgress(false);
                return;
            }
            this.showStatus("Uploading...", 0);
            var localFileSystem = this.syncView.getLocalFileSystem();
            var file = localFileSystem.getFile(this.fullPath);
            var remoteParentPath = PathUtil.dirname(this.path);
            var taskManager = this.syncView.getTaskManager();
            return taskManager.uploadItem(remoteParentPath, file, function (canceled, err) {
                _this.setTransferInProgress(false);
                if (err != null) {
                    return _this.showStatus("Upload failed: " + err, 2);
                }
                else if (canceled) {
                    return _this.showStatus("Upload canceled", 2);
                }
                else {
                    return _this.showStatus("Uploaded", 1);
                }
            });
        };
        CacheItemView.prototype.download = function () {
            var _this = this;
            if (this.isHeader) {
                this.syncView.downloadChecked();
                return;
            }
            if (this.transferInProgress) {
                return;
            }
            this.setTransferInProgress(true);
            this.showStatus("Downloading...", 0);
            var taskManager = this.syncView.getTaskManager();
            var fileSystem = taskManager.getFileSystem();
            var file = fileSystem.getFile(this.path);
            var localParentPath = PathUtil.dirname(this.fullPath);
            return taskManager.downloadItem(localParentPath, file, function (canceled, err) {
                _this.setTransferInProgress(false);
                if (err != null) {
                    var message = "Download failed.";
                    if (err.message != null) {
                        message += " " + err.message;
                    }
                    return _this.showStatus(message, 2);
                }
                else if (canceled) {
                    return _this.showStatus("Download canceled", 2);
                }
                else {
                    return _this.showStatus("Downloaded", 1);
                }
            });
        };
        CacheItemView.prototype.compare = function () {
            var _this = this;
            if (!fsp.isFileSync(this.fullPath)) {
                this.showStatus("Cached file could not be found.", 2);
                return;
            }
            if (this.transferInProgress) {
                return;
            }
            this.setTransferInProgress(true);
            this.showStatus("Downloading for comparison...", 0);
            var taskManager = this.syncView.getTaskManager();
            var remoteFileSystem = taskManager.getFileSystem();
            var remoteFile = remoteFileSystem.getFile(this.path);
            return remoteFile.createReadStream(function (err, stream) {
                return _this.remoteStreamCreated(err, stream);
            });
        };
        CacheItemView.prototype.remoteStreamCreated = function (err, stream) {
            var _this = this;
            var message;
            if (err != null) {
                message = "Error reading remote file. ";
                if (err.message != null) {
                    message += err.message;
                }
                this.showStatus(message, 2);
                this.setTransferInProgress(false);
                return;
            }
            var buffer = new Buffer();
            stream.on("data", function (data) {
                return buffer.push(data);
            });
            stream.on("end", function () {
                _this.remoteStreamRead(buffer.toString());
                buffer = null;
                _this.showStatus("", 0);
                return _this.setTransferInProgress(false);
            });
            return stream.on("error", function (err) {
                buffer = null;
                message = "Error reading remote file. ";
                if (err.message != null) {
                    message += err.message;
                }
                _this.showStatus(message, 2);
                return _this.setTransferInProgress(false);
            });
        };
        CacheItemView.prototype.remoteStreamRead = function (text) {
            var localFileSystem = this.syncView.getLocalFileSystem();
            var localFile = localFileSystem.getFile(this.fullPath);
            var title = "Diff " + localFile.getBaseName() + " | server";
            return Utils.compareFiles(title, this.path, localFile, text);
        };
        CacheItemView.prototype.promptDelete = function () {
            if (this.isHeader) {
                this.syncView.deleteChecked();
                return;
            }
            if (this.transferInProgress) {
                return;
            }
            var response = atom.confirm({
                message: "Remove",
                detailedMessage: "Remove " + this.path + " from the cache?",
                buttons: ["No", "Yes"]
            });
            if (response === 1) {
                return this["delete"]();
            }
        };
        CacheItemView.prototype["delete"] = function () {
            if (this.transferInProgress) {
                return;
            }
            fse.removeSync(this.fullPath);
            return this.syncView.removeItem(this);
        };
        CacheItemView.prototype.showStatus = function (text, code) {
            this.jstatus.removeClass("text");
            this.jstatus.removeClass("text-error");
            this.jstatus.removeClass("text-success");
            this.jstatus.text(text);
            if (code === 0) {
                return this.jstatus.addClass("text");
            }
            else if (code === 1) {
                return this.jstatus.addClass("text-success");
            }
            else {
                return this.jstatus.addClass("text-error");
            }
        };
        CacheItemView.prototype.setTransferInProgress = function (transferInProgress) {
            this.transferInProgress = transferInProgress;
            this.uploadButton.attr("disabled", this.transferInProgress);
            this.downloadButton.attr("disabled", this.transferInProgress);
            this.deleteButton.attr("disabled", this.transferInProgress);
            return (this.compareButton != null ? this.compareButton.attr("disabled", this.transferInProgress) : undefined);
        };
        return CacheItemView;
    }(HTMLElement)));
module.exports = document.registerElement("cache-item-view", { prototype: CacheItemView.prototype, "extends": "tr" });
//# sourceMappingURL=cache-item-view.js.map