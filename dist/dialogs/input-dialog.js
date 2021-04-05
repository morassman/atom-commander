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
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var InputDialog;
var CompositeDisposable = require('atom').CompositeDisposable;
var _a = require('atom-space-pen-views'), $ = _a.$, View = _a.View, TextEditorView = _a.TextEditorView;
module.exports =
    (InputDialog = /** @class */ (function (_super) {
        __extends(InputDialog, _super);
        function InputDialog(prompt, text, password, callback) {
            var _this = this;
            _this.prompt = prompt;
            _this.text = text;
            _this.password = password;
            _this.callback = callback;
            _this = _super.call(this, _this.prompt) || this;
            _this.focusedElement = null;
            return _this;
        }
        InputDialog.content = function (prompt) {
            var _this = this;
            return this.div({ "class": "atom-commander-input-dialog" }, function () {
                _this.div(prompt);
                _this.subview("editor", new TextEditorView({ mini: true }));
                return _this.div({ "class": "bottom-button-panel" }, function () {
                    _this.button("Cancel", { "class": "btn", click: "cancel" });
                    return _this.button("OK", { "class": "btn", click: "confirm" });
                });
            });
        };
        InputDialog.prototype.initialize = function () {
            var _this = this;
            if (this.text != null) {
                this.editor.getModel().setText(this.text);
            }
            if (this.password) {
                this.editor.addClass("atom-commander-password");
            }
            this.disposables = new CompositeDisposable();
            this.disposables.add(atom.commands.add(this.element, "core:confirm", function () { return _this.confirm(); }));
            return this.disposables.add(atom.commands.add(this.element, "core:cancel", function () { return _this.cancel(); }));
        };
        InputDialog.prototype.attach = function () {
            this.focusedElement = $(':focus');
            this.panel = atom.workspace.addModalPanel({ item: this.element });
            return this.editor.focus();
        };
        InputDialog.prototype.close = function () {
            if ((this.focusedElement !== null) && this.focusedElement.isOnDom()) {
                this.focusedElement.focus();
            }
            else {
                atom.views.getView(atom.workspace).focus();
            }
            var panelToDestroy = this.panel;
            this.panel = null;
            if (panelToDestroy != null) {
                panelToDestroy.destroy();
            }
            return this.disposables.dispose();
        };
        InputDialog.prototype.cancel = function () {
            this.close();
            return this.callback(null);
        };
        InputDialog.prototype.confirm = function () {
            this.close();
            return this.callback(this.editor.getModel().getText());
        };
        return InputDialog;
    }(View)));
//# sourceMappingURL=input-dialog.js.map