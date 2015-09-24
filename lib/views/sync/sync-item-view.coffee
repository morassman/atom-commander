fsp = require 'fs-plus'
fse = require 'fs-extra'
{$, $$} = require 'atom-space-pen-views'

module.exports =
class SyncItemView extends HTMLElement

  initializeHeader: (@syncView) ->
    @initialize(true)
    @pathElement.textContent = "Selection";

  initializeRow: (@syncView, @fullPath, @path) ->
    @initialize(false);
    @pathElement.textContent = @path;

  initialize: (@isHeader) ->
    @checkElement = document.createElement("td");
    @pathElement = document.createElement("td");
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

    @check = $$ ->
      @input {type: "checkbox"}
    @uploadButton = $$ ->
      @button "Upload", {class: "btn btn-sm"}
    @downloadButton = $$ ->
      @button "Download", {class: "btn btn-sm"}
    @deleteButton = $$ ->
      @button "Delete", {class: "btn btn-sm"}

    @uploadButton.click => @upload();
    @downloadButton.click => @download();
    @deleteButton.click => @delete();

    @uploadButton.on 'mousedown', (e) -> e.preventDefault();
    @downloadButton.on 'mousedown', (e) -> e.preventDefault();
    @deleteButton.on 'mousedown', (e) -> e.preventDefault();

    @jcheck.append(@check);
    @jupload.append(@uploadButton);
    @jdownload.append(@downloadButton);
    @jdelete.append(@deleteButton);

    if !@isHeader
      @jcompare = $(@compareElement);

      @compareButton = $$ ->
        @button "Compare", {class: "btn btn-sm"}

      @compareButton.click(@compare);
      @compareButton.on 'mousedown', (e) -> e.preventDefault();
      @jcompare.append(@compareButton);

    @appendChild(@checkElement);
    @appendChild(@pathElement);
    @appendChild(@compareElement);
    @appendChild(@uploadElement);
    @appendChild(@downloadElement);
    @appendChild(@deleteElement);
    @appendChild(@statusElement);

  upload: ->
    @jstatus.text("Uploading...");
    fileSystem = @syncView.getFileSystem();
    fileSystem.download @fullPath, @path, (err) =>
      if err?
        @jstatus.text("Upload failed: "+err);
      else
        @jstatus.text("Uploaded");

  download: ->
    @jstatus.text("Downloading...");
    fileSystem = @syncView.getFileSystem();
    fileSystem.download @path, @fullPath, (err) =>
      if err?
        @jstatus.text("Download failed: "+err);
      else
        @jstatus.text("Downloaded");

  compare: ->
    if !fsp.isFileSync(@fullPath)
      return;

  delete: ->
    fse.removeSync(@fullPath);
    @remove();

module.exports = document.registerElement("sync-item-view", prototype: SyncItemView.prototype, extends: "tr")
