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
        # @div {class: 'panel-heading', outlet:'leftHeader'}
        @subview 'leftTextEditor', new TextEditorView();
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

    @leftBuffer = @leftTextEditor.getModel().getBuffer();
    @rightBuffer = @rightTextEditor.getModel().getBuffer();

    @leftTextEditor.css("height", "100%");
    @rightTextEditor.css("height", "100%");

    @leftTextEditor.on 'contextmenu', false
    @rightTextEditor.on 'contextmenu', false

    @leftTextEditor.mousedown (e) =>
      @handleMouseDown(e, @leftTextEditor);

    @rightTextEditor.mousedown (e) =>
      @handleMouseDown(e, @rightTextEditor);

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

  handleMouseDown: (e, textEditor) ->
    @resetSelections();
    y = e.offsetY + textEditor.getModel().getScrollTop();
    @selection = @getDecorationAtPixelY(y, textEditor);

    if (@selection == null)
      return;

    @highlightDecoration(@selection);
    @highlightDecoration(@selection.otherDecoration);

    if textEditor == @leftTextEditor
      @scrollToDecoration(@rightTextEditor, @selection.otherDecoration);
    else
      @scrollToDecoration(@leftTextEditor, @selection.otherDecoration);

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

  getDecorationAtPixelY: (y, textEditor) ->
    if textEditor == @leftTextEditor
      decorations = @leftDecorations;
    else
      decorations = @rightDecorations;

    lineHeight = textEditor.getModel().getLineHeightInPixels();

    for decoration in decorations
      pixelRange = decoration.getMarker().getPixelRange();

      if ((y >= pixelRange.start.top) and (y <= (pixelRange.end.top + lineHeight)))
        return decoration;

    return null;

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
        @appendPart(@leftTextEditor, @leftBuffer, @leftDecorations, part, true);
      else if part.removed
        @appendPart(@rightTextEditor, @rightBuffer, @rightDecorations, part, false);
      else
        leftDecoration = @appendPart(@leftTextEditor, @leftBuffer, @leftDecorations, part);
        rightDecoration = @appendPart(@rightTextEditor, @rightBuffer, @rightDecorations, part);
        leftDecoration['otherDecoration'] = rightDecoration;
        rightDecoration['otherDecoration'] = leftDecoration;

  appendPart: (editor, buffer, decorations, part, added=null) =>
    cls = 'line-normal';
    lines = part.value.split("\n")
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

  destroy: ->
    @disposables?.dispose();

  serialize: ->
