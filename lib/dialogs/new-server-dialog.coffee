FTPDialog = require './ftp-dialog'
SFTPDialog = require './sftp-dialog'
{View} = require 'atom-space-pen-views'

module.exports =
class NewServerDialog extends View

  constructor: (@containerView) ->
    super();
    @ftpDialog.setParentDialog(@);
    @sftpDialog.setParentDialog(@);
    @currentDialog = @ftpDialog;
    @sftpDialog.detach();

  @content: ->
    @div class: "atom-commander-new-server-dialog", =>
      @div "Add Server", {class: "heading"}
      @div {class: "button-panel block"}, =>
        @div {class: "btn-group"}, =>
          @button "FTP", {class: "btn selected", outlet: "ftpButton", click: "ftpClicked"}
          @button "SFTP", {class: "btn", outlet: "sftpButton", click: "sftpClicked"}
      @div {outlet: "dialogContainer"}, =>
        @subview "ftpDialog", new FTPDialog()
        @subview "sftpDialog", new SFTPDialog()

  # Called from the embedded dialog after it got initialized.
  # The dialog that was initialized. Either FTPDialog or SFTPDialog.
  dialogInitialized: (dialog) ->

  getMain: ->
    return @containerView.getMain();

  getServerManager: ->
    return @containerView.getMain().getServerManager();

  serverExists: (id) ->
    return @getServerManager().getFileSystemWithID(id) != null;

  ftpClicked: ->
    @setSelected(@ftpButton, @ftpDialog);

  sftpClicked: ->
    @setSelected(@sftpButton, @sftpDialog);

  setSelected: (button, dialog) ->
    @ftpButton.removeClass("selected");
    @sftpButton.removeClass("selected");
    button.addClass("selected");

    @currentDialog.detach();
    @currentDialog = dialog;
    @currentDialog.appendTo(@dialogContainer);
    @currentDialog.selected();

  attach: ->
    @panel = atom.workspace.addModalPanel(item: this.element);
    @currentDialog.selected();

  addServer: (config) ->
    @close();
    serverManager = @getServerManager();
    server = serverManager.addServer(config);
    @containerView.openDirectory(server.getInitialDirectory());

  close: ->
    panelToDestroy = @panel;
    @panel = null;
    panelToDestroy?.destroy();
    @containerView.requestFocus();
