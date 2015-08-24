jsdiff = require 'diff';
{$, $$, View} = require 'atom-space-pen-views'
{CompositeDisposable} = require 'atom'

module.exports =
class DiffView extends View

  constructor: (@title, @leftFile, @rightFile) ->
    super(@title, @leftFile, @rightFile);

  @content: ->
    @div {class: 'atom-commander-diff-view', outlet:'topView'}, =>
      @div {class: 'heading'}, =>
        @div {class: 'pane left-pane'}, =>
          @div {class: 'title', outlet: 'leftHeader'}
        @div {class: 'pane right-pane'}, =>
          @div {class: 'title', outlet: 'rightHeader'}
      @div {class: 'body'}, =>
        @div {class: 'pane left-pane', outlet:'leftPane'}, =>
          @div {class: 'text-pane-scroller', outlet: 'leftTextPane'}
            # @div {class: 'text-pane', tabindex: -1, outlet: 'leftTextPane'}

        @div {class: 'pane right-pane', outlet:'rightPane'}, =>
          @div {class: 'text-pane-scroller', outlet: 'rightTextPane'}
            # @div {class: 'text-pane', tabindex: -1, outlet: 'rightTextPane'}

      # @div {class: 'pane left-pane', outlet:'leftPane'}, =>
      #   @div {class: 'panel-heading heading', outlet: 'leftHeader'}
      #   @div {class: 'text-pane-scroller', outlet: 'leftTextPane'}
      #     # @div {class: 'text-pane', tabindex: -1, outlet: 'leftTextPane'}
      # @div {class: 'pane right-pane'}, =>
      #   @div {class: 'panel-heading', outlet: 'rightHeader'}
      #   @div {class: 'text-pane-scroller', outlet: 'rightTextPane'}
      #     # @div {class: 'text-pane', tabindex: -1, outlet: 'rightTextPane'}

  initialize: ->
    fontFamily = atom.config.get("editor.fontFamily");
    @fontSize = atom.config.get("editor.fontSize");
    @lineHeight = atom.config.get("editor.lineHeight");

    @disposables = new CompositeDisposable();

    @leftTextPane.css("font-family", fontFamily);
    @leftTextPane.css("font-size", @fontSize);

    @rightTextPane.css("font-family", fontFamily);
    @rightTextPane.css("font-size", @fontSize);

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
    @leftTextPane.empty();
    @rightTextPane.empty();

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

    @leftTextPane.empty();
    @rightTextPane.empty();

    diff = jsdiff.diffLines(@rightContent, @leftContent);

    diff.forEach (part) =>
      # console.log(part);

      if part.added
        @appendPart(@leftTextPane, part, true);
      else if part.removed
        @appendPart(@rightTextPane, part, false);
      else
        @appendPart(@leftTextPane, part);
        @appendPart(@rightTextPane, part);

  appendPart: (pane, part, added=null) =>
    lines = part.value.split("\n")
    count = lines.length;

    if (part.count != null) and (part.count != undefined)
      count = part.count;

    if added != null
      if (added)
        cls = "line-added";
      else
        cls = "line-removed";

    # if part.value.trim().length == 0
    #     cls += "-empty";

    div = $$ ->
      @div {class:cls}

    for i in [1..Math.min(lines.length, count)]
      line = lines[i-1];
      cls = "";
      setHeight = false;

      # if added != null
      #   if (added)
      #     cls = "line-added";
      #   else
      #     cls = "line-removed";
      #
      #   if line.trim().length == 0
      #     cls += "-empty";
      #     setHeight = true;

      # span = $$ ->
        # @span lines[i-1], {class:cls}

      # if setHeight
        # span.height(@fontSize);

      div.append(line);
      div.append("<br>");
      # pane.append(span);
      # pane.append("<br>")

    pane.append(div);

  getTitle: ->
    return @title;

  destroy: ->
    @disposables?.dispose();

  serialize: ->
