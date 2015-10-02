SSH2 = require 'ssh2'
FTPFileSystem = require '../fs/ftp/ftp-filesystem'
{View, TextEditorView} = require 'atom-space-pen-views'

module.exports =
class SFTPDialog extends View

  constructor: ->
    super();
    @username = "";
    @ssh2 = null;

  setParentDialog: (@parentDialog) ->

  @content: ->
    @div class: "atom-commander-ftp-dialog", =>
      # @div "New SFTP Connection", {class: "heading"}
      @table =>
        @tbody =>
          @tr =>
            @td "URL", {class: "text-highlight"}
            @td "sftp://", {outlet: "url"}
          @tr =>
            @td "Server", {class: "text-highlight"}
            @td =>
              @subview "serverEditor", new TextEditorView(mini: true)
          @tr =>
            @td "Port", {class: "text-highlight"}
            @td =>
              @subview "portEditor", new TextEditorView(mini: true)
          @tr =>
            @td "Folder", {class: "text-highlight"}
            @td =>
              @subview "folderEditor", new TextEditorView(mini: true)
          @tr =>
            @td "Username", {class: "text-highlight"}
            @td =>
              @subview "usernameEditor", new TextEditorView(mini: true)
          @tr =>
            @td "Password", {class: "text-highlight"}
            @td {class: "password"}, =>
              @subview "passwordEditor", new TextEditorView(mini: true)
          @tr =>
            @td "Remember Password", {class: "text-highlight"}
            @td =>
              @input {type: "checkbox", outlet: "storeCheckBox"}
          @tr =>
            @td =>
              @span "Passwords are encrypted", {class: "encrypted"}
      @div {class: "test-button-panel"}, =>
        @button "Test", {class: "btn", click: "test", outlet: "testButton"}
      @div {class: "bottom-button-panel"}, =>
        @button "Cancel", {class: "btn", click: "cancel", outlet: "cancelButton"}
        @button "OK", {class: "btn", click: "confirm", outlet: "okButton"}
      @div =>
        @span {class: "loading loading-spinner-tiny inline-block", outlet: "spinner"}
        @span {class: "message", outlet: "message"}

  initialize: ->
    @serverEditor.attr("tabindex", 1);
    @portEditor.attr("tabindex", 2);
    @folderEditor.attr("tabindex", 3);
    @usernameEditor.attr("tabindex", 4);
    @passwordEditor.attr("tabindex", 5);
    @storeCheckBox.attr("tabindex", 6);
    @testButton.attr("tabindex", 7);
    @okButton.attr("tabindex", 8);
    @cancelButton.attr("tabindex", 9);

    @spinner.hide();
    @portEditor.getModel().setText("22");
    @storeCheckBox.prop("checked", true);

    @serverEditor.getModel().onDidChange =>
      @refreshURL();
      @refreshError();

    @portEditor.getModel().onDidChange =>
      @refreshURL();
      @refreshError();

    @folderEditor.getModel().onDidChange =>
      @refreshURL();
      @refreshError();

    @usernameEditor.getModel().onDidChange =>
      @username = @usernameEditor.getModel().getText().trim();
      @refreshError();

    @passwordEditor.getModel().onDidChange =>
      @refreshError();

    atom.commands.add @element,
      "core:confirm": => @confirm()
      "core:cancel": => @cancel()

    @refreshError();

  getPort: ->
    port = @portEditor.getModel().getText().trim();

    if port.length == 0
      return 22;

    port = parseInt(port);

    if isNaN(port)
      return null;

    return port;

  refreshURL: ->
    server = @getServer();
    port = @portEditor.getModel().getText().trim();

    url = "sftp://" + server;

    if (server.length > 0)
      port = @getPort();

      if (port != null) and (port != 22)
        url += ":" + port;

    url += @getFolder();
    @url.text(url);

  refreshError: ->
    message = @getErrorMessage();

    if (message == null)
      @showMessage("", 0);
    else
      @showMessage(message, 2);

  getErrorMessage: ->
    server = @getServer();
    if server.length == 0
      return "Server must be specified."

    username = @getUsername();
    if username.length == 0
      return "Username must be specified."

    port = @getPort();
    if port == null
      return "Invalid port number.";

    if @serverExists(server, port, username)
      return "This server has already been added.";

    if @getPassword().length == 0
      return "Password must be specified."

    return null;

  showMessage: (text, type) ->
    @messageType = type;

    @message.removeClass("text-error");
    @message.removeClass("text-warning");
    @message.removeClass("text-success");

    if @messageType == 0
      @message.addClass("text-success");
    else if @messageType == 1
      @message.addClass("text-warning");
    else
      @message.addClass("text-error");

    @message.text(text);

  serverExists: (server, port, username) ->
    id = "sftp_"+server+"_"+port+"_"+username;
    return @parentDialog.serverExists(id);

  getServer: ->
    return @serverEditor.getModel().getText().trim();

  getFolder: ->
    folder = @folderEditor.getModel().getText().trim();

    if (folder.length > 0)
      if folder[0] != "/"
        folder = "/"+folder;
    else
      folder = "/";

    return folder;

  getUsername: ->
    return @username;

  getPassword: ->
    return @passwordEditor.getModel().getText().trim();

  isStoreCheckBoxSelected: ->
    return @storeCheckBox.is(":checked");

  getSFTPConfig: ->
    config = {};

    config.protocol = "sftp";
    config.host = @getServer();
    config.port = @getPort();
    config.folder = @getFolder();
    config.username = @username;
    config.password = @getPassword();
    config.passwordDecrypted = true;
    config.storePassword = @isStoreCheckBoxSelected();

    return config;

  selected: ->
    @serverEditor.focus();
  # attach: ->
  #   @panel = atom.workspace.addModalPanel(item: this.element);
  #   @serverEditor.focus();
  #   @serverEditor.getModel().scrollToCursorPosition();

  close: ->
    @parentDialog.close();
    # panelToDestroy = @panel;
    # @panel = null;
    # panelToDestroy?.destroy();
    # @containerView.requestFocus();

  confirm: ->
    if @hasError()
      return;

    @parentDialog.addServer(@getSFTPConfig());

  cancel: ->
    @parentDialog.close();

  hasError: ->
    return @messageType == 2;

  test: ->
    if @hasError() or (@ssh2 != null)
      return;

    @ssh2 = new SSH2();
    config = @getSFTPConfig();
    config.tryKeyboard = true;

    @ssh2.on "ready", =>
      @ssh2.sftp (err, sftp) =>
        @spinner.hide();

        if err?
          if err.message?
            @showMessage("Connection failed. "+err.message, 1);
          else
            @showMessage("Connection failed", 1);
        else
          @showMessage("Connection successful", 0);

        @ssh2.end();
        @ssh2 = null;

    @ssh2.on "error", (err) =>
      @spinner.hide();

      if err.message?
        @showMessage("Connection failed. "+err.message, 1);
      else
        @showMessage("Connection failed", 1);

      @ssh2.end();
      @ssh2 = null;

    @ssh2.on "keyboard-interactive", (name, instructions, instructionsLang, prompt, finish) =>
      finish([config.password]);

    @spinner.show();
    @ssh2.connect(config);
