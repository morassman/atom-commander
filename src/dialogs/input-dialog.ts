/*
 * decaffeinate suggestions:
 * DS002: Fix invalid constructor
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let InputDialog;
const {CompositeDisposable} = require('atom');
const {$, View, TextEditorView} = require('atom-space-pen-views');

module.exports =
(InputDialog = class InputDialog extends View {

  constructor(prompt, text, password, callback) {
    this.prompt = prompt;
    this.text = text;
    this.password = password;
    this.callback = callback;
    super(this.prompt);
    this.focusedElement = null;
  }

  static content(prompt) {
    return this.div({class: "atom-commander-input-dialog"}, () => {
      this.div(prompt);
      this.subview("editor", new TextEditorView({mini: true}));
      return this.div({class: "bottom-button-panel"}, () => {
        this.button("Cancel", {class: "btn", click: "cancel"});
        return this.button("OK", {class: "btn", click: "confirm"});
    });
  });
  }

  initialize() {
    if (this.text != null) {
      this.editor.getModel().setText(this.text);
    }

    if (this.password) {
      this.editor.addClass("atom-commander-password");
    }

    this.disposables = new CompositeDisposable();
    this.disposables.add(atom.commands.add(this.element, "core:confirm", () => this.confirm()));
    return this.disposables.add(atom.commands.add(this.element, "core:cancel", () => this.cancel()));
  }

  attach() {
    this.focusedElement = $(':focus');
    this.panel = atom.workspace.addModalPanel({item: this.element});
    return this.editor.focus();
  }

  close() {
    if ((this.focusedElement !== null) && this.focusedElement.isOnDom()) {
      this.focusedElement.focus();
    } else {
      atom.views.getView(atom.workspace).focus();
    }

    const panelToDestroy = this.panel;
    this.panel = null;
    if (panelToDestroy != null) {
      panelToDestroy.destroy();
    }
    return this.disposables.dispose();
  }

  cancel() {
    this.close();
    return this.callback(null);
  }

  confirm() {
    this.close();
    return this.callback(this.editor.getModel().getText());
  }
});
