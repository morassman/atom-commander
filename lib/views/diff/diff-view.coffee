jsdiff = require 'diff';
Buffer = require '../../buffer'
util = require 'util'
{$, $$, View, TextEditorView} = require 'atom-space-pen-views'
{CompositeDisposable, Range} = require 'atom'

module.exports =
class DiffView extends View

  constructor: (@title, @tooltip, @leftFile, @rightFile) ->
    super(@title, @tooltip, @leftFile, @rightFile);

  @content: ->
    @div {class: 'atom-commander-diff-view'}, =>
      @div "Loading...", {class: 'left-status', outlet: 'leftStatus'}
      @div {class: 'left-pane'}, =>
        # @div {class: 'panel-heading', outlet:'leftHeader'}
        @subview 'leftTextEditor', new TextEditorView();
      @div "Loading...", {class: 'right-status', outlet: 'rightStatus'}
      @div {class: 'right-pane'}, =>
        @subview 'rightTextEditor', new TextEditorView();

  initialize: ->
    @disposables = new CompositeDisposable();

    @markers = [];
    @leftDecorations = [];
    @rightDecorations = [];
    @selection = null;

    @leftTextEditor[0].removeAttribute('tabindex');
    @leftTextEditor.getModel().getDecorations({class: 'cursor-line', type: 'line'})[0].destroy();
    @rightTextEditor[0].removeAttribute('tabindex');
    @rightTextEditor.getModel().getDecorations({class: 'cursor-line', type: 'line'})[0].destroy();

    @leftEditorBuffer = @leftTextEditor.getModel().getBuffer();
    @rightEditorBuffer = @rightTextEditor.getModel().getBuffer();

    @leftTextEditor.css("height", "100%");
    @rightTextEditor.css("height", "100%");

    @leftTextEditor.on 'contextmenu', false
    @rightTextEditor.on 'contextmenu', false

    @leftTextEditor.getModel().onDidChangeCursorPosition (e) =>
      @handleCursorPositionChange(e, @leftTextEditor, @leftDecorations);

    @rightTextEditor.getModel().onDidChangeCursorPosition (e) =>
      @handleCursorPositionChange(e, @rightTextEditor, @rightDecorations);

    @leftBuffer = new Buffer();
    @rightBuffer = new Buffer();

    @refreshFileNames();
    @readFiles();

    # @disposables.add(@leftFile.onDidChange(@readFiles));
    # @disposables.add(@rightFile.onDidChange(@readFiles));
    # @disposables.add(@leftFile.onDidRename(@refreshFileNames));
    # @disposables.add(@rightFile.onDidRename(@refreshFileNames));

  resetSelections: ->
    if @selection == null
      return;

    @resetSelection(@selection);
    @resetSelection(@selection.otherDecoration);

    @selection = null;

  resetSelection: (selection) ->
    if !selection?
      return;

    properties = selection.getProperties();

    newProperties = {};
    newProperties.type = properties.type;
    newProperties.class = properties.class.replace("-highlight", "");

    selection.setProperties(newProperties);

  handleCursorPositionChange: (e, textEditor, decorations) ->
    @resetSelections();

    @selection = @getDecorationAtBufferPosition(e.newBufferPosition, decorations);

    if (@selection == null)
      return;

    @highlightDecoration(@selection);
    @highlightDecoration(@selection.otherDecoration);

    if textEditor == @leftTextEditor
      @scrollToDecoration(@rightTextEditor, @selection.otherDecoration);
    else
      @scrollToDecoration(@leftTextEditor, @selection.otherDecoration);

  getDecorationAtBufferPosition: (bufferPosition, decorations) ->
    row = bufferPosition.row;

    for decoration in decorations
      range = decoration.getMarker().getBufferRange();
      if row >= range.start.row && row <= range.end.row
        return decoration;

    return null;

  scrollToDecoration: (textEditor, decoration) ->
    if !decoration?
      return;

    textEditor.getModel().scrollToBufferPosition(decoration.getMarker().getStartBufferPosition());

  highlightDecoration: (decoration) ->
    if (!decoration?)
      return;

    properties = decoration.getProperties();

    if properties.class.search("highlight") != -1
      return;

    newProperties = {};
    newProperties.type = properties.type;
    newProperties.class = properties.class+"-highlight";

    decoration.setProperties(newProperties);

  refreshFileNames: =>
    # @leftHeader.text(@leftFile.getRealPathSync());
    # @rightHeader.text(@rightFile.getRealPathSync());

  readFiles: =>
    @resetSelections();

    for decoration in @leftDecorations
      decoration.destroy();

    for decoration in @rightDecorations
      decoration.destroy();

    for marker in @markers
      marker.destroy();

    @markers = [];
    @leftDecorations = [];
    @rightDecorations = [];
    @leftSelection = null;
    @rightSelection = null;

    @leftEditorBuffer.setText("");
    @rightEditorBuffer.setText("");

    @leftContent = null;
    @rightContent = null;

    if util.isString(@leftFile)
      @leftContent = @leftFile;
      @leftStatus.hide();
    else
      @leftFile.createReadStream (err, stream) =>
        @readStreamCallback(true, @leftBuffer, err, stream);

    if util.isString(@rightFile)
      @rightContent = @rightFile;
      @rightStatus.hide();
    else
      @rightFile.createReadStream (err, stream) =>
        @readStreamCallback(false, @rightBuffer, err, stream);

    @fileRead();

  readStreamCallback: (left, buffer, err, stream) ->
    if err?
      @setStatusError(left, err);
      return;

    stream.on "data", (data) =>
      buffer.push(data);

    stream.on "end", =>
      if left
        @leftContent = buffer.toString();
        buffer.clear();
      else
        @rightContent = buffer.toString();
        buffer.clear();
      @fileRead();
      @hideStatus(left);

    stream.on "error", (err) =>
      @setStatusError(left, err);

  setStatusError: (left, err) ->
    message = "Error loading file.";

    if err.message
      message += " "+err.message;

    if left
      @leftStatus.text(message);
    else
      @rightStatus.text(message);

  hideStatus: (left) ->
    if left
      @leftStatus.hide();
    else
      @rightStatus.hide();

  fileRead: =>
    if (@leftContent == null) or (@rightContent == null)
      return;

    @leftEditorBuffer.setText("");
    @rightEditorBuffer.setText("");

    diff = jsdiff.diffLines(@rightContent, @leftContent);

    diff.forEach (part) =>
      if part.added
        @appendPart(@leftTextEditor, @leftEditorBuffer, @leftDecorations, part, true);
      else if part.removed
        @appendPart(@rightTextEditor, @rightEditorBuffer, @rightDecorations, part, false);
      else
        leftDecoration = @appendPart(@leftTextEditor, @leftEditorBuffer, @leftDecorations, part);
        rightDecoration = @appendPart(@rightTextEditor, @rightEditorBuffer, @rightDecorations, part);
        leftDecoration['otherDecoration'] = rightDecoration;
        rightDecoration['otherDecoration'] = leftDecoration;

  appendPart: (editor, buffer, decorations, part, added=null) =>
    cls = 'line-normal';
    lines = part.value.split(/\r?\n/);
    count = lines.length;

    if (part.count != null) and (part.count != undefined)
      count = part.count;

    if added != null
      if (added)
        cls = "line-added";
      else
        cls = "line-removed";

    options = {};
    options.normalizeLineEndings = true;
    options.undo = "skip"
    startPoint = buffer.getEndPosition();

    for i in [1..Math.min(lines.length, count)]
      line = lines[i-1];
      buffer.append(line, options);
      endPoint = buffer.getEndPosition();
      buffer.append("\n", options);

    range = new Range(startPoint, endPoint);
    marker = editor.getModel().markBufferRange(range, invalidate: 'never');
    @markers.push[marker];

    decoration = editor.getModel().decorateMarker(marker, {type: 'line', class: cls})
    decorations.push(decoration);

    return decoration;

  getTitle: ->
    return @title;

  getPath: ->
    return @tooltip;

  destroy: ->
    @disposables?.dispose();

  serialize: ->
