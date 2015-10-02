{CompositeDisposable} = require 'atom'
{$, View, TextEditorView} = require 'atom-space-pen-views'

module.exports =
class InputDialog extends View

  constructor: (@prompt, @text, @password, @callback) ->
    super(@prompt)
    @focusedElement = null;

  @content: (prompt) ->
    @div class: "atom-commander-input-dialog", =>
      @div prompt
      @subview "editor", new TextEditorView(mini: true)
      @div {class: "bottom-button-panel"}, =>
        @button "Cancel", {class: "btn", click: "cancel"}
        @button "OK", {class: "btn", click: "confirm"}

  initialize: ->
    if @text?
      @editor.getModel().setText(@text);

    if @password
      @editor.addClass("atom-commander-password");

    @disposables = new CompositeDisposable();
    @disposables.add atom.commands.add @element, "core:confirm", => @confirm()
    @disposables.add atom.commands.add @element, "core:cancel", => @cancel()

  attach: ->
    @focusedElement = $(':focus');
    @panel = atom.workspace.addModalPanel(item: @element);
    @editor.focus();

  close: ->
    if (@focusedElement != null) and @focusedElement.isOnDom()
      @focusedElement.focus();
    else
      atom.views.getView(atom.workspace).focus();

    panelToDestroy = @panel;
    @panel = null;
    panelToDestroy?.destroy();
    @disposables.dispose();

  cancel: ->
    @close();
    @callback(null);

  confirm: ->
    @close();
    @callback(@editor.getModel().getText());
