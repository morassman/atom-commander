jsdiff = require 'diff';
{$$, View} = require 'atom-space-pen-views'
{CompositeDisposable} = require 'atom'

module.exports =
class DiffView extends View

  constructor: (@title, @leftFile, @rightFile) ->
    super(@title, @leftFile, @rightFile);

  @content: ->
    @div {class: 'diff-view'}, =>
      @div {class: 'pane left-pane'}, =>
        @div {class: 'panel-heading', outlet: 'leftHeader'}
        @div {class: 'text-pane-scroller'}, =>
          @div {class: 'text-pane', tabindex: -1, outlet: 'leftPane'}
      @div {class: 'pane right-pane'}, =>
        @div {class: 'panel-heading', outlet: 'rightHeader'}
        @div {class: 'text-pane-scroller'}, =>
          @div {class: 'text-pane', tabindex: -1, outlet: 'rightPane'}

  initialize: ->
    fontFamily = atom.config.get("editor.fontFamily");
    fontSize = atom.config.get("editor.fontSize");

    @disposables = new CompositeDisposable();

    @leftPane.css("font-family", fontFamily);
    @leftPane.css("font-size", fontSize);

    @rightPane.css("font-family", fontFamily);
    @rightPane.css("font-size", fontSize);

    @refreshFileNames();
    @readFiles();

    @disposables.add(@leftFile.onDidChange(@readFiles));
    @disposables.add(@rightFile.onDidChange(@readFiles));
    @disposables.add(@leftFile.onDidRename(@refreshFileNames));
    @disposables.add(@rightFile.onDidRename(@refreshFileNames));

  refreshFileNames: =>
    @leftHeader.text(@leftFile.getRealPathSync());
    @rightHeader.text(@rightFile.getRealPathSync());

  readFiles: =>
    @leftPane.empty();
    @rightPane.empty();

    @leftContent = null;
    @rightContent = null;

    @leftFile.read(true).then (content) =>
      @leftContent = content;
      @fileRead(true);

    @rightFile.read(true).then (content) =>
      @rightContent = content;
      @fileRead(false);

  fileRead: (left) =>
    if (@leftContent == null) or (@rightContent == null)
      return;

    @leftPane.empty();
    @rightPane.empty();

    diff = jsdiff.diffLines(@rightContent, @leftContent);

    diff.forEach (part) =>
      # console.log(part.value);

      if part.added
        @appendPart(@leftPane, part, "status-added");
      else if part.removed
        @appendPart(@rightPane, part, "status-removed");
      else
        @appendPart(@leftPane, part, "");
        @appendPart(@rightPane, part, "");

  appendPart: (pane, part, cls) ->
    lines = part.value.split("\n")

    for i in [1..Math.min(lines.length, part.count)]
      pane.append $$ ->
        @span lines[i-1], {class:cls}
      pane.append("<br>")

  getTitle: ->
    return @title;

  destroy: ->
    @disposables?.dispose();

  serialize: ->
