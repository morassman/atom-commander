SSH2 = require 'ssh2'
FTPFileSystem = require '../fs/ftp/ftp-filesystem'
{View, TextEditorView} = require 'atom-space-pen-views'

module.exports =
class SFTPDialog extends View

  constructor: (@containerView) ->
    super();
    @username = "";
    @ssh2 = null;

  @content: ->
    @div class: "atom-commander-ftp-dialog", =>
      @div "New SFTP Connection", {class: "heading"}
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
    @testButton.attr("tabindex", 6);
    @okButton.attr("tabindex", 7);
    @cancelButton.attr("tabindex", 8);

    @spinner.hide();
    @portEditor.getModel().setText("22");

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
    if @getServer().length == 0
      return "Server must be specified."

    if @getUsername().length == 0
      return "Username must be specified."

    if @getPassword().length == 0
      return "Password must be specified."

    if @getPort() == null
      return "Invalid port number.";

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

  getSFTPConfig: ->
    config = {};

    config.protocol = "sftp";
    config.host = @getServer();
    config.port = @getPort();
    config.folder = @getFolder();
    config.username = @username;
    config.password = @getPassword();
    config.tryKeyboard = true;

    return config;

  attach: ->
    @panel = atom.workspace.addModalPanel(item: this.element);
    @serverEditor.focus();
    @serverEditor.getModel().scrollToCursorPosition();

  close: ->
    panelToDestroy = @panel;
    @panel = null;
    panelToDestroy?.destroy();
    @containerView.requestFocus();

  confirm: ->
    if @hasError()
      return;

    @close();

    serverManager = @containerView.getMain().getServerManager();
    server = serverManager.addServer(@getSFTPConfig());
    directory = server.getFileSystem().getDirectory(@getFolder());
    @containerView.openDirectory(directory);

  cancel: ->
    @close();

  hasError: ->
    return @messageType == 2;

  test: ->
    if @hasError() or (@ssh2 != null)
      return;

    @ssh2 = new SSH2();
    config = @getSFTPConfig();

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
