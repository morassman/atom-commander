/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let CacheItemView;
const fsp = require('fs-plus');
const fse = require('fs-extra');
const {$, $$} = require('atom-space-pen-views');
const PathUtil = require('path');
const Utils = require('../../utils');
const Buffer = require('../../buffer');

module.exports =
(CacheItemView = class CacheItemView extends HTMLElement {

  initializeHeader(syncView) {
    this.syncView = syncView;
    this.initialize(true);
    return this.pathElement.textContent = "Selection";
  }

  initializeRow(syncView, fullPath, path) {
    this.syncView = syncView;
    this.fullPath = fullPath;
    this.path = path;
    this.initialize(false);
    return this.pathElement.textContent = this.path;
  }

  initialize(isHeader) {
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

    this.check = $$(function() {
      return this.input({type: "checkbox"});});
    this.uploadButton = $$(function() {
      return this.button("Upload", {class: "btn btn-sm"});});
    this.downloadButton = $$(function() {
      return this.button("Download", {class: "btn btn-sm"});});
    this.deleteButton = $$(function() {
      return this.button("Remove", {class: "btn btn-sm"});});

    this.check.change(() => this.checkChanged());
    this.uploadButton.click(() => this.upload());
    this.downloadButton.click(() => this.download());
    this.deleteButton.click(() => this.promptDelete());

    this.uploadButton.on('mousedown', e => e.preventDefault());
    this.downloadButton.on('mousedown', e => e.preventDefault());
    this.deleteButton.on('mousedown', e => e.preventDefault());

    this.jcheck.append(this.check);
    this.jupload.append(this.uploadButton);
    this.jdownload.append(this.downloadButton);
    this.jdelete.append(this.deleteButton);

    if (!this.isHeader) {
      this.jopen = $(this.openElement);
      this.openButton = $$(function() {
        return this.button("Open", {class: "btn btn-sm"});});
      this.openButton.click(() => this.open());
      this.openButton.on('mousedown', e => e.preventDefault());
      this.jopen.append(this.openButton);

      this.jcompare = $(this.compareElement);
      this.compareButton = $$(function() {
        return this.button("Compare", {class: "btn btn-sm"});});
      this.compareButton.click(() => this.compare());
      this.compareButton.on('mousedown', e => e.preventDefault());
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
  }

  setChecked(checked) {
    if (checked !== this.isChecked()) {
      return this.check.trigger("click");
    }
  }

  checkChanged() {
    if (this.isHeader) {
      return this.syncView.setAllChecked(this.check.is(":checked"));
    }
  }

  isChecked() {
    return this.check.is(":checked");
  }

  open() {
    return atom.workspace.open(this.fullPath);
  }

  upload() {
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

    const localFileSystem = this.syncView.getLocalFileSystem();
    const file = localFileSystem.getFile(this.fullPath);
    const remoteParentPath = PathUtil.dirname(this.path);
    const taskManager = this.syncView.getTaskManager();

    return taskManager.uploadItem(remoteParentPath, file, (canceled, err) => {
      this.setTransferInProgress(false);

      if (err != null) {
        return this.showStatus("Upload failed: "+err, 2);
      } else if (canceled) {
        return this.showStatus("Upload canceled", 2);
      } else {
        return this.showStatus("Uploaded", 1);
      }
    });
  }

  download() {
    if (this.isHeader) {
      this.syncView.downloadChecked();
      return;
    }

    if (this.transferInProgress) {
      return;
    }

    this.setTransferInProgress(true);
    this.showStatus("Downloading...", 0);

    const taskManager = this.syncView.getTaskManager();
    const fileSystem = taskManager.getFileSystem();
    const file = fileSystem.getFile(this.path);
    const localParentPath = PathUtil.dirname(this.fullPath);

    return taskManager.downloadItem(localParentPath, file, (canceled, err) => {
      this.setTransferInProgress(false);

      if (err != null) {
        let message = "Download failed.";

        if (err.message != null) {
          message += " "+err.message;
        }

        return this.showStatus(message, 2);
      } else if (canceled) {
        return this.showStatus("Download canceled", 2);
      } else {
        return this.showStatus("Downloaded", 1);
      }
    });
  }

  compare() {
    if (!fsp.isFileSync(this.fullPath)) {
      this.showStatus("Cached file could not be found.", 2);
      return;
    }

    if (this.transferInProgress) {
      return;
    }

    this.setTransferInProgress(true);

    this.showStatus("Downloading for comparison...", 0);

    const taskManager = this.syncView.getTaskManager();
    const remoteFileSystem = taskManager.getFileSystem();
    const remoteFile = remoteFileSystem.getFile(this.path);

    return remoteFile.createReadStream((err, stream) => {
      return this.remoteStreamCreated(err, stream);
    });
  }

  remoteStreamCreated(err, stream) {
    let message;
    if (err != null) {
      message = "Error reading remote file. ";
      if (err.message != null) {
        message += err.message;
      }
      this.showStatus(message, 2);
      this.setTransferInProgress(false);
      return;
    }

    let buffer = new Buffer();

    stream.on("data", data => {
      return buffer.push(data);
    });

    stream.on("end", () => {
      this.remoteStreamRead(buffer.toString());
      buffer = null;
      this.showStatus("", 0);
      return this.setTransferInProgress(false);
    });

    return stream.on("error", err => {
      buffer = null;
      message = "Error reading remote file. ";
      if (err.message != null) {
        message += err.message;
      }
      this.showStatus(message, 2);
      return this.setTransferInProgress(false);
    });
  }

  remoteStreamRead(text) {
    const localFileSystem = this.syncView.getLocalFileSystem();
    const localFile = localFileSystem.getFile(this.fullPath);
    const title = "Diff "+localFile.getBaseName()+" | server";

    return Utils.compareFiles(title, this.path, localFile, text);
  }

  promptDelete() {
    if (this.isHeader) {
      this.syncView.deleteChecked();
      return;
    }

    if (this.transferInProgress) {
      return;
    }

    const response = atom.confirm({
      message: "Remove",
      detailedMessage: `Remove ${this.path} from the cache?`,
      buttons: ["No", "Yes"]});

    if (response === 1) {
      return this.delete();
    }
  }

  delete() {
    if (this.transferInProgress) {
      return;
    }

    fse.removeSync(this.fullPath);
    return this.syncView.removeItem(this);
  }

  showStatus(text, code) {
    this.jstatus.removeClass("text");
    this.jstatus.removeClass("text-error");
    this.jstatus.removeClass("text-success");

    this.jstatus.text(text);

    if (code === 0) {
      return this.jstatus.addClass("text");
    } else if (code === 1) {
      return this.jstatus.addClass("text-success");
    } else {
      return this.jstatus.addClass("text-error");
    }
  }

  setTransferInProgress(transferInProgress) {
    this.transferInProgress = transferInProgress;
    this.uploadButton.attr("disabled", this.transferInProgress);
    this.downloadButton.attr("disabled", this.transferInProgress);
    this.deleteButton.attr("disabled", this.transferInProgress);
    return (this.compareButton != null ? this.compareButton.attr("disabled", this.transferInProgress) : undefined);
  }
});

module.exports = document.registerElement("cache-item-view", {prototype: CacheItemView.prototype, extends: "tr"});
