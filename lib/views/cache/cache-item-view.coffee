fsp = require 'fs-plus'
fse = require 'fs-extra'
{$, $$} = require 'atom-space-pen-views'
PathUtil = require 'path'
Utils = require '../../utils'
Buffer = require '../../buffer'

module.exports =
class CacheItemView extends HTMLElement

  initializeHeader: (@syncView) ->
    @initialize(true)
    @pathElement.textContent = "Selection";

  initializeRow: (@syncView, @fullPath, @path) ->
    @initialize(false);
    @pathElement.textContent = @path;

  initialize: (@isHeader) ->
    @checkElement = document.createElement("td");
    @pathElement = document.createElement("td");
    @openElement = document.createElement("td");
    @compareElement = document.createElement("td");
    @uploadElement = document.createElement("td");
    @downloadElement = document.createElement("td");
    @deleteElement = document.createElement("td");
    @statusElement = document.createElement("td");

    @jcheck = $(@checkElement);
    @jpath = $(@pathElement);
    @jupload = $(@uploadElement);
    @jdownload = $(@downloadElement);
    @jdelete = $(@deleteElement);
    @jstatus = $(@statusElement);

    @jpath.css("padding-right", "32px");

    @check = $$ ->
      @input {type: "checkbox"}
    @uploadButton = $$ ->
      @button "Upload", {class: "btn btn-sm"}
    @downloadButton = $$ ->
      @button "Download", {class: "btn btn-sm"}
    @deleteButton = $$ ->
      @button "Remove", {class: "btn btn-sm"}

    @check.change => @checkChanged();
    @uploadButton.click => @upload();
    @downloadButton.click => @download();
    @deleteButton.click => @promptDelete();

    @uploadButton.on 'mousedown', (e) -> e.preventDefault();
    @downloadButton.on 'mousedown', (e) -> e.preventDefault();
    @deleteButton.on 'mousedown', (e) -> e.preventDefault();

    @jcheck.append(@check);
    @jupload.append(@uploadButton);
    @jdownload.append(@downloadButton);
    @jdelete.append(@deleteButton);

    if !@isHeader
      @jopen = $(@openElement);
      @openButton = $$ ->
        @button "Open", {class: "btn btn-sm"}
      @openButton.click => @open();
      @openButton.on 'mousedown', (e) -> e.preventDefault();
      @jopen.append(@openButton);

      @jcompare = $(@compareElement);
      @compareButton = $$ ->
        @button "Compare", {class: "btn btn-sm"}
      @compareButton.click => @compare();
      @compareButton.on 'mousedown', (e) -> e.preventDefault();
      @jcompare.append(@compareButton);

    @appendChild(@checkElement);
    @appendChild(@pathElement);
    @appendChild(@openElement);
    @appendChild(@compareElement);
    @appendChild(@uploadElement);
    @appendChild(@downloadElement);
    @appendChild(@deleteElement);
    @appendChild(@statusElement);

    @setTransferInProgress(false);

  setChecked: (checked) ->
    if checked != @isChecked()
      @check.trigger("click");

  checkChanged: ->
    if @isHeader
      @syncView.setAllChecked(@check.is(":checked"));

  isChecked: ->
    return @check.is(":checked");

  open: ->
    atom.workspace.open(@fullPath);

  upload: ->
    if @isHeader
      @syncView.uploadChecked();
      return;

    if @transferInProgress
      return;

    @setTransferInProgress(true);

    if !fsp.isFileSync(@fullPath)
      @showStatus("Cached file could not be found.", 2);
      @setTransferInProgress(false);
      return;

    @showStatus("Uploading...", 0);

    localFileSystem = @syncView.getLocalFileSystem();
    file = localFileSystem.getFile(@fullPath);
    remoteParentPath = PathUtil.dirname(@path);
    taskManager = @syncView.getTaskManager();

    taskManager.uploadItem remoteParentPath, file, (canceled, err) =>
      @setTransferInProgress(false);

      if err?
        @showStatus("Upload failed: "+err, 2);
      else if canceled
        @showStatus("Upload canceled", 2);
      else
        @showStatus("Uploaded", 1);

  download: ->
    if @isHeader
      @syncView.downloadChecked();
      return;

    if @transferInProgress
      return;

    @setTransferInProgress(true);
    @showStatus("Downloading...", 0);

    taskManager = @syncView.getTaskManager();
    fileSystem = taskManager.getFileSystem();
    file = fileSystem.getFile(@path);
    localParentPath = PathUtil.dirname(@fullPath);

    taskManager.downloadItem localParentPath, file, (canceled, err) =>
      @setTransferInProgress(false);

      if err?
        message = "Download failed.";

        if err.message?
          message += " "+err.message;

        @showStatus(message, 2);
      else if canceled
        @showStatus("Download canceled", 2);
      else
        @showStatus("Downloaded", 1);

  compare: ->
    if !fsp.isFileSync(@fullPath)
      @showStatus("Cached file could not be found.", 2);
      return;

    if @transferInProgress
      return;

    @setTransferInProgress(true);

    @showStatus("Downloading for comparison...", 0);

    taskManager = @syncView.getTaskManager();
    remoteFileSystem = taskManager.getFileSystem();
    remoteFile = remoteFileSystem.getFile(@path);

    remoteFile.createReadStream (err, stream) =>
      @remoteStreamCreated(err, stream);

  remoteStreamCreated: (err, stream) ->
    if err?
      message = "Error reading remote file. "
      if err.message?
        message += err.message;
      @showStatus(message, 2);
      @setTransferInProgress(false);
      return;

    buffer = new Buffer();

    stream.on "data", (data) =>
      buffer.push(data);

    stream.on "end", =>
      @remoteStreamRead(buffer.toString());
      buffer = null;
      @showStatus("", 0);
      @setTransferInProgress(false);

    stream.on "error", (err) =>
      buffer = null;
      message = "Error reading remote file. "
      if err.message?
        message += err.message;
      @showStatus(message, 2);
      @setTransferInProgress(false);

  remoteStreamRead: (text) ->
    localFileSystem = @syncView.getLocalFileSystem();
    localFile = localFileSystem.getFile(@fullPath);
    title = "Diff "+localFile.getBaseName()+" | server";

    Utils.compareFiles(title, @path, localFile, text);

  promptDelete: ->
    if @isHeader
      @syncView.deleteChecked();
      return;

    if @transferInProgress
      return;

    option = atom.confirm
      message: "Remove"
      detailedMessage: "Remove #{@path} from the cache?"
      buttons: ["No", "Yes"]

    if option == 1
      @delete();

  delete: ->
    if @transferInProgress
      return;

    fse.removeSync(@fullPath);
    @syncView.removeItem(@);

  showStatus: (text, code) ->
    @jstatus.removeClass("text");
    @jstatus.removeClass("text-error");
    @jstatus.removeClass("text-success");

    @jstatus.text(text);

    if code == 0
      @jstatus.addClass("text");
    else if code == 1
      @jstatus.addClass("text-success");
    else
      @jstatus.addClass("text-error");

  setTransferInProgress: (@transferInProgress) ->
    @uploadButton.attr("disabled", @transferInProgress);
    @downloadButton.attr("disabled", @transferInProgress);
    @deleteButton.attr("disabled", @transferInProgress);
    @compareButton?.attr("disabled", @transferInProgress);

module.exports = document.registerElement("cache-item-view", prototype: CacheItemView.prototype, extends: "tr")
