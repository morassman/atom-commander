jsdiff = require 'diff';
{$, $$, View, TextEditorView} = require 'atom-space-pen-views'
{CompositeDisposable, Range} = require 'atom'

module.exports =
class DiffView extends View

  constructor: (@title, @leftFile, @rightFile) ->
    super(@title, @leftFile, @rightFile);

  @content: ->
    @div {class: 'atom-commander-diff-view'}, =>
      @div {class: 'left-pane'}, =>
        @subview 'leftTextEditor', new TextEditorView();
      @div {class: 'right-pane'}, =>
        @subview 'rightTextEditor', new TextEditorView();

  initialize: ->
    @disposables = new CompositeDisposable();

    @markers = [];

    @leftBuffer = @leftTextEditor.model.buffer;
    @rightBuffer = @rightTextEditor.model.buffer;

    @leftTextEditor.css("height", "100%");
    @rightTextEditor.css("height", "100%");

    @refreshFileNames();
    @readFiles();

    @disposables.add(@leftFile.onDidChange(@readFiles));
    @disposables.add(@rightFile.onDidChange(@readFiles));
    @disposables.add(@leftFile.onDidRename(@refreshFileNames));
    @disposables.add(@rightFile.onDidRename(@refreshFileNames));

  refreshFileNames: =>
    # @leftHeader.text(@leftFile.getRealPathSync());
    # @rightHeader.text(@rightFile.getRealPathSync());

  readFiles: =>
    for marker in @markers
      marker.destroy();

    @markers = [];
    @leftBuffer.setText("");
    @rightBuffer.setText("");

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

    @leftBuffer.setText("");
    @rightBuffer.setText("");

    diff = jsdiff.diffLines(@rightContent, @leftContent);

    diff.forEach (part) =>
      if part.added
        @appendPart(@leftTextEditor, @leftBuffer, part, true);
      else if part.removed
        @appendPart(@rightTextEditor, @rightBuffer, part, false);
      else
        @appendPart(@leftTextEditor, @leftBuffer, part);
        @appendPart(@rightTextEditor, @rightBuffer, part);

  appendPart: (editor, buffer, part, added=null) =>
    cls = null;
    lines = part.value.split("\n")
    count = lines.length;

    if (part.count != null) and (part.count != undefined)
      count = part.count;

    if added != null
      if (added)
        cls = "git-line-added";
        # cls = "atom-commander-diff-line-added";
      else
        cls = "git-line-removed";
        # cls = "atom-commander-diff-line-removed";

    options = {};
    options.normalizeLineEndings = true;
    options.undo = "skip"
    startPoint = buffer.getEndPosition();

    for i in [1..Math.min(lines.length, count)]
      line = lines[i-1];
      buffer.append(line, options);
      endPoint = buffer.getEndPosition();
      buffer.append("\n", options);

    if (cls != null)
      range = new Range(startPoint, endPoint);
      marker = editor.model.markBufferRange(range);
      @markers.push[marker];
      decoration = editor.model.decorateMarker(marker, {type: 'line-number', class: cls})

  getTitle: ->
    return @title;

  destroy: ->
    @disposables?.dispose();

  serialize: ->
