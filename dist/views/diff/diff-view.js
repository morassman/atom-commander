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
 * DS002: Fix invalid constructor
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var DiffView;
var jsdiff = require('diff');
var Buffer = require('../../buffer');
var util = require('util');
var _a = require('atom-space-pen-views'), $ = _a.$, $$ = _a.$$, View = _a.View, TextEditorView = _a.TextEditorView;
var _b = require('atom'), CompositeDisposable = _b.CompositeDisposable, Range = _b.Range;
module.exports =
    (DiffView = /** @class */ (function (_super) {
        __extends(DiffView, _super);
        function DiffView(title, tooltip, leftFile, rightFile) {
            var _this = this;
            _this.refreshFileNames = _this.refreshFileNames.bind(_this);
            _this.readFiles = _this.readFiles.bind(_this);
            _this.fileRead = _this.fileRead.bind(_this);
            _this.appendPart = _this.appendPart.bind(_this);
            _this.title = title;
            _this.tooltip = tooltip;
            _this.leftFile = leftFile;
            _this.rightFile = rightFile;
            _this = _super.call(this, _this.title, _this.tooltip, _this.leftFile, _this.rightFile) || this;
            return _this;
        }
        DiffView.content = function () {
            var _this = this;
            return this.div({ "class": 'atom-commander-diff-view' }, function () {
                _this.div("Loading...", { "class": 'left-status', outlet: 'leftStatus' });
                _this.div({ "class": 'left-pane' }, function () {
                    // @div {class: 'panel-heading', outlet:'leftHeader'}
                    return _this.subview('leftTextEditor', new TextEditorView());
                });
                _this.div("Loading...", { "class": 'right-status', outlet: 'rightStatus' });
                return _this.div({ "class": 'right-pane' }, function () {
                    return _this.subview('rightTextEditor', new TextEditorView());
                });
            });
        };
        DiffView.prototype.initialize = function () {
            var _this = this;
            this.disposables = new CompositeDisposable();
            this.markers = [];
            this.leftDecorations = [];
            this.rightDecorations = [];
            this.selection = null;
            this.leftTextEditor[0].removeAttribute('tabindex');
            this.rightTextEditor[0].removeAttribute('tabindex');
            var leftDecorations = this.leftTextEditor.getModel().getDecorations({ "class": 'cursor-line', type: 'line' });
            var rightDecorations = this.rightTextEditor.getModel().getDecorations({ "class": 'cursor-line', type: 'line' });
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
            this.leftTextEditor.getModel().onDidChangeCursorPosition(function (e) {
                return _this.handleCursorPositionChange(e, _this.leftTextEditor, _this.leftDecorations);
            });
            this.rightTextEditor.getModel().onDidChangeCursorPosition(function (e) {
                return _this.handleCursorPositionChange(e, _this.rightTextEditor, _this.rightDecorations);
            });
            this.leftBuffer = new Buffer();
            this.rightBuffer = new Buffer();
            this.refreshFileNames();
            return this.readFiles();
        };
        // @disposables.add(@leftFile.onDidChange(@readFiles));
        // @disposables.add(@rightFile.onDidChange(@readFiles));
        // @disposables.add(@leftFile.onDidRename(@refreshFileNames));
        // @disposables.add(@rightFile.onDidRename(@refreshFileNames));
        DiffView.prototype.resetSelections = function () {
            if (this.selection === null) {
                return;
            }
            this.resetSelection(this.selection);
            this.resetSelection(this.selection.otherDecoration);
            return this.selection = null;
        };
        DiffView.prototype.resetSelection = function (selection) {
            if ((selection == null)) {
                return;
            }
            var properties = selection.getProperties();
            var newProperties = {};
            newProperties.type = properties.type;
            newProperties["class"] = properties["class"].replace("-highlight", "");
            return selection.setProperties(newProperties);
        };
        DiffView.prototype.handleCursorPositionChange = function (e, textEditor, decorations) {
            this.resetSelections();
            this.selection = this.getDecorationAtBufferPosition(e.newBufferPosition, decorations);
            if (this.selection === null) {
                return;
            }
            this.highlightDecoration(this.selection);
            this.highlightDecoration(this.selection.otherDecoration);
            if (textEditor === this.leftTextEditor) {
                return this.scrollToDecoration(this.rightTextEditor, this.selection.otherDecoration);
            }
            else {
                return this.scrollToDecoration(this.leftTextEditor, this.selection.otherDecoration);
            }
        };
        DiffView.prototype.getDecorationAtBufferPosition = function (bufferPosition, decorations) {
            var row = bufferPosition.row;
            for (var _i = 0, _a = Array.from(decorations); _i < _a.length; _i++) {
                var decoration = _a[_i];
                var range = decoration.getMarker().getBufferRange();
                if ((row >= range.start.row) && (row <= range.end.row)) {
                    return decoration;
                }
            }
            return null;
        };
        DiffView.prototype.scrollToDecoration = function (textEditor, decoration) {
            if ((decoration == null)) {
                return;
            }
            return textEditor.getModel().scrollToBufferPosition(decoration.getMarker().getStartBufferPosition());
        };
        DiffView.prototype.highlightDecoration = function (decoration) {
            if ((decoration == null)) {
                return;
            }
            var properties = decoration.getProperties();
            if (properties["class"].search("highlight") !== -1) {
                return;
            }
            var newProperties = {};
            newProperties.type = properties.type;
            newProperties["class"] = properties["class"] + "-highlight";
            return decoration.setProperties(newProperties);
        };
        DiffView.prototype.refreshFileNames = function () { };
        // @leftHeader.text(@leftFile.getRealPathSync());
        // @rightHeader.text(@rightFile.getRealPathSync());
        DiffView.prototype.readFiles = function () {
            var _this = this;
            var decoration;
            this.resetSelections();
            for (var _i = 0, _a = Array.from(this.leftDecorations); _i < _a.length; _i++) {
                decoration = _a[_i];
                decoration.destroy();
            }
            for (var _b = 0, _c = Array.from(this.rightDecorations); _b < _c.length; _b++) {
                decoration = _c[_b];
                decoration.destroy();
            }
            for (var _d = 0, _e = Array.from(this.markers); _d < _e.length; _d++) {
                var marker = _e[_d];
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
            }
            else {
                this.leftFile.createReadStream(function (err, stream) {
                    return _this.readStreamCallback(true, _this.leftBuffer, err, stream);
                });
            }
            if (util.isString(this.rightFile)) {
                this.rightContent = this.rightFile;
                this.rightStatus.hide();
            }
            else {
                this.rightFile.createReadStream(function (err, stream) {
                    return _this.readStreamCallback(false, _this.rightBuffer, err, stream);
                });
            }
            return this.fileRead();
        };
        DiffView.prototype.readStreamCallback = function (left, buffer, err, stream) {
            var _this = this;
            if (err != null) {
                this.setStatusError(left, err);
                return;
            }
            stream.on("data", function (data) {
                return buffer.push(data);
            });
            stream.on("end", function () {
                if (left) {
                    _this.leftContent = buffer.toString();
                    buffer.clear();
                }
                else {
                    _this.rightContent = buffer.toString();
                    buffer.clear();
                }
                _this.fileRead();
                return _this.hideStatus(left);
            });
            return stream.on("error", function (err) {
                return _this.setStatusError(left, err);
            });
        };
        DiffView.prototype.setStatusError = function (left, err) {
            var message = "Error loading file.";
            if (err.message) {
                message += " " + err.message;
            }
            if (left) {
                return this.leftStatus.text(message);
            }
            else {
                return this.rightStatus.text(message);
            }
        };
        DiffView.prototype.hideStatus = function (left) {
            if (left) {
                return this.leftStatus.hide();
            }
            else {
                return this.rightStatus.hide();
            }
        };
        DiffView.prototype.fileRead = function () {
            var _this = this;
            if ((this.leftContent === null) || (this.rightContent === null)) {
                return;
            }
            this.leftEditorBuffer.setText("");
            this.rightEditorBuffer.setText("");
            var diff = jsdiff.diffLines(this.rightContent, this.leftContent);
            return diff.forEach(function (part) {
                if (part.added) {
                    return _this.appendPart(_this.leftTextEditor, _this.leftEditorBuffer, _this.leftDecorations, part, true);
                }
                else if (part.removed) {
                    return _this.appendPart(_this.rightTextEditor, _this.rightEditorBuffer, _this.rightDecorations, part, false);
                }
                else {
                    var leftDecoration = _this.appendPart(_this.leftTextEditor, _this.leftEditorBuffer, _this.leftDecorations, part);
                    var rightDecoration = _this.appendPart(_this.rightTextEditor, _this.rightEditorBuffer, _this.rightDecorations, part);
                    leftDecoration['otherDecoration'] = rightDecoration;
                    return rightDecoration['otherDecoration'] = leftDecoration;
                }
            });
        };
        DiffView.prototype.appendPart = function (editor, buffer, decorations, part, added) {
            if (added === void 0) { added = null; }
            var endPoint;
            var cls = 'line-normal';
            var lines = part.value.split(/\r?\n/);
            var count = lines.length;
            if ((part.count !== null) && (part.count !== undefined)) {
                (count = part.count);
            }
            if (added !== null) {
                if (added) {
                    cls = "line-added";
                }
                else {
                    cls = "line-removed";
                }
            }
            var options = {};
            options.normalizeLineEndings = true;
            options.undo = "skip";
            var startPoint = buffer.getEndPosition();
            for (var i = 1, end = Math.min(lines.length, count), asc = 1 <= end; asc ? i <= end : i >= end; asc ? i++ : i--) {
                var line = lines[i - 1];
                buffer.append(line, options);
                endPoint = buffer.getEndPosition();
                buffer.append("\n", options);
            }
            var range = new Range(startPoint, endPoint);
            var marker = editor.getModel().markBufferRange(range, { invalidate: 'never' });
            this.markers.push[marker];
            var decoration = editor.getModel().decorateMarker(marker, { type: 'line', "class": cls });
            decorations.push(decoration);
            return decoration;
        };
        DiffView.prototype.getTitle = function () {
            return this.title;
        };
        DiffView.prototype.getPath = function () {
            return this.tooltip;
        };
        DiffView.prototype.destroy = function () {
            return (this.disposables != null ? this.disposables.dispose() : undefined);
        };
        DiffView.prototype.serialize = function () { };
        return DiffView;
    }(View)));
//# sourceMappingURL=diff-view.js.map