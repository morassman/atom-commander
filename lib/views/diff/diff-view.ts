/*
 * decaffeinate suggestions:
 * DS002: Fix invalid constructor
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let DiffView;
const jsdiff = require('diff');
const Buffer = require('../../buffer');
const util = require('util');
const {$, $$, View, TextEditorView} = require('atom-space-pen-views');
const {CompositeDisposable, Range} = require('atom');

module.exports =
(DiffView = class DiffView extends View {

  constructor(title, tooltip, leftFile, rightFile) {
    this.refreshFileNames = this.refreshFileNames.bind(this);
    this.readFiles = this.readFiles.bind(this);
    this.fileRead = this.fileRead.bind(this);
    this.appendPart = this.appendPart.bind(this);
    this.title = title;
    this.tooltip = tooltip;
    this.leftFile = leftFile;
    this.rightFile = rightFile;
    super(this.title, this.tooltip, this.leftFile, this.rightFile);
  }

  static content() {
    return this.div({class: 'atom-commander-diff-view'}, () => {
      this.div("Loading...", {class: 'left-status', outlet: 'leftStatus'});
      this.div({class: 'left-pane'}, () => {
        // @div {class: 'panel-heading', outlet:'leftHeader'}
        return this.subview('leftTextEditor', new TextEditorView());
      });
      this.div("Loading...", {class: 'right-status', outlet: 'rightStatus'});
      return this.div({class: 'right-pane'}, () => {
        return this.subview('rightTextEditor', new TextEditorView());
      });
    });
  }

  initialize() {
    this.disposables = new CompositeDisposable();

    this.markers = [];
    this.leftDecorations = [];
    this.rightDecorations = [];
    this.selection = null;

    this.leftTextEditor[0].removeAttribute('tabindex');
    this.rightTextEditor[0].removeAttribute('tabindex');

    const leftDecorations = this.leftTextEditor.getModel().getDecorations({class: 'cursor-line', type: 'line'});
    const rightDecorations = this.rightTextEditor.getModel().getDecorations({class: 'cursor-line', type: 'line'});

    if (leftDecorations.length > 0) {
      leftDecorations[0].destroy();
    }

    if (rightDecorations.length > 0) {
      rightDecorations[0].destroy();
    }

    this.leftEditorBuffer = this.leftTextEditor.getModel().getBuffer();
    this.rightEditorBuffer = this.rightTextEditor.getModel().getBuffer();

    this.leftTextEditor.css("height", "100%");
    this.rightTextEditor.css("height", "100%");

    this.leftTextEditor.on('contextmenu', false);
    this.rightTextEditor.on('contextmenu', false);

    this.leftTextEditor.getModel().onDidChangeCursorPosition(e => {
      return this.handleCursorPositionChange(e, this.leftTextEditor, this.leftDecorations);
    });

    this.rightTextEditor.getModel().onDidChangeCursorPosition(e => {
      return this.handleCursorPositionChange(e, this.rightTextEditor, this.rightDecorations);
    });

    this.leftBuffer = new Buffer();
    this.rightBuffer = new Buffer();

    this.refreshFileNames();
    return this.readFiles();
  }

    // @disposables.add(@leftFile.onDidChange(@readFiles));
    // @disposables.add(@rightFile.onDidChange(@readFiles));
    // @disposables.add(@leftFile.onDidRename(@refreshFileNames));
    // @disposables.add(@rightFile.onDidRename(@refreshFileNames));

  resetSelections() {
    if (this.selection === null) {
      return;
    }

    this.resetSelection(this.selection);
    this.resetSelection(this.selection.otherDecoration);

    return this.selection = null;
  }

  resetSelection(selection) {
    if ((selection == null)) {
      return;
    }

    const properties = selection.getProperties();

    const newProperties = {};
    newProperties.type = properties.type;
    newProperties.class = properties.class.replace("-highlight", "");

    return selection.setProperties(newProperties);
  }

  handleCursorPositionChange(e, textEditor, decorations) {
    this.resetSelections();

    this.selection = this.getDecorationAtBufferPosition(e.newBufferPosition, decorations);

    if (this.selection === null) {
      return;
    }

    this.highlightDecoration(this.selection);
    this.highlightDecoration(this.selection.otherDecoration);

    if (textEditor === this.leftTextEditor) {
      return this.scrollToDecoration(this.rightTextEditor, this.selection.otherDecoration);
    } else {
      return this.scrollToDecoration(this.leftTextEditor, this.selection.otherDecoration);
    }
  }

  getDecorationAtBufferPosition(bufferPosition, decorations) {
    const {
      row
    } = bufferPosition;

    for (let decoration of Array.from(decorations)) {
      const range = decoration.getMarker().getBufferRange();
      if ((row >= range.start.row) && (row <= range.end.row)) {
        return decoration;
      }
    }

    return null;
  }

  scrollToDecoration(textEditor, decoration) {
    if ((decoration == null)) {
      return;
    }

    return textEditor.getModel().scrollToBufferPosition(decoration.getMarker().getStartBufferPosition());
  }

  highlightDecoration(decoration) {
    if ((decoration == null)) {
      return;
    }

    const properties = decoration.getProperties();

    if (properties.class.search("highlight") !== -1) {
      return;
    }

    const newProperties = {};
    newProperties.type = properties.type;
    newProperties.class = properties.class+"-highlight";

    return decoration.setProperties(newProperties);
  }

  refreshFileNames() {}
    // @leftHeader.text(@leftFile.getRealPathSync());
    // @rightHeader.text(@rightFile.getRealPathSync());

  readFiles() {
    let decoration;
    this.resetSelections();

    for (decoration of Array.from(this.leftDecorations)) {
      decoration.destroy();
    }

    for (decoration of Array.from(this.rightDecorations)) {
      decoration.destroy();
    }

    for (let marker of Array.from(this.markers)) {
      marker.destroy();
    }

    this.markers = [];
    this.leftDecorations = [];
    this.rightDecorations = [];
    this.leftSelection = null;
    this.rightSelection = null;

    this.leftEditorBuffer.setText("");
    this.rightEditorBuffer.setText("");

    this.leftContent = null;
    this.rightContent = null;

    if (util.isString(this.leftFile)) {
      this.leftContent = this.leftFile;
      this.leftStatus.hide();
    } else {
      this.leftFile.createReadStream((err, stream) => {
        return this.readStreamCallback(true, this.leftBuffer, err, stream);
      });
    }

    if (util.isString(this.rightFile)) {
      this.rightContent = this.rightFile;
      this.rightStatus.hide();
    } else {
      this.rightFile.createReadStream((err, stream) => {
        return this.readStreamCallback(false, this.rightBuffer, err, stream);
      });
    }

    return this.fileRead();
  }

  readStreamCallback(left, buffer, err, stream) {
    if (err != null) {
      this.setStatusError(left, err);
      return;
    }

    stream.on("data", data => {
      return buffer.push(data);
    });

    stream.on("end", () => {
      if (left) {
        this.leftContent = buffer.toString();
        buffer.clear();
      } else {
        this.rightContent = buffer.toString();
        buffer.clear();
      }
      this.fileRead();
      return this.hideStatus(left);
    });

    return stream.on("error", err => {
      return this.setStatusError(left, err);
    });
  }

  setStatusError(left, err) {
    let message = "Error loading file.";

    if (err.message) {
      message += " "+err.message;
    }

    if (left) {
      return this.leftStatus.text(message);
    } else {
      return this.rightStatus.text(message);
    }
  }

  hideStatus(left) {
    if (left) {
      return this.leftStatus.hide();
    } else {
      return this.rightStatus.hide();
    }
  }

  fileRead() {
    if ((this.leftContent === null) || (this.rightContent === null)) {
      return;
    }

    this.leftEditorBuffer.setText("");
    this.rightEditorBuffer.setText("");

    const diff = jsdiff.diffLines(this.rightContent, this.leftContent);

    return diff.forEach(part => {
      if (part.added) {
        return this.appendPart(this.leftTextEditor, this.leftEditorBuffer, this.leftDecorations, part, true);
      } else if (part.removed) {
        return this.appendPart(this.rightTextEditor, this.rightEditorBuffer, this.rightDecorations, part, false);
      } else {
        const leftDecoration = this.appendPart(this.leftTextEditor, this.leftEditorBuffer, this.leftDecorations, part);
        const rightDecoration = this.appendPart(this.rightTextEditor, this.rightEditorBuffer, this.rightDecorations, part);
        leftDecoration['otherDecoration'] = rightDecoration;
        return rightDecoration['otherDecoration'] = leftDecoration;
      }
    });
  }

  appendPart(editor, buffer?, decorations?, part?, added=null) {
    let endPoint;
    let cls = 'line-normal';
    const lines = part.value.split(/\r?\n/);
    let count = lines.length;

    if ((part.count !== null) && (part.count !== undefined)) {
      ({
        count
      } = part);
    }

    if (added !== null) {
      if (added) {
        cls = "line-added";
      } else {
        cls = "line-removed";
      }
    }

    const options = {};
    options.normalizeLineEndings = true;
    options.undo = "skip";
    const startPoint = buffer.getEndPosition();

    for (let i = 1, end = Math.min(lines.length, count), asc = 1 <= end; asc ? i <= end : i >= end; asc ? i++ : i--) {
      const line = lines[i-1];
      buffer.append(line, options);
      endPoint = buffer.getEndPosition();
      buffer.append("\n", options);
    }

    const range = new Range(startPoint, endPoint);
    const marker = editor.getModel().markBufferRange(range, {invalidate: 'never'});
    this.markers.push[marker];

    const decoration = editor.getModel().decorateMarker(marker, {type: 'line', class: cls});
    decorations.push(decoration);

    return decoration;
  }

  getTitle() {
    return this.title;
  }

  getPath() {
    return this.tooltip;
  }

  destroy() {
    return (this.disposables != null ? this.disposables.dispose() : undefined);
  }

  serialize() {}
});
