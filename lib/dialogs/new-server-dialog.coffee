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

  addServer: (config) ->
    @close();
    serverManager = @containerView.getMain().getServerManager();
    server = serverManager.addServer(config);
    @containerView.openDirectory(server.getInitialDirectory());

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
    # @serverEditor.focus();
    # @serverEditor.getModel().scrollToCursorPosition();

  close: ->
    panelToDestroy = @panel;
    @panel = null;
    panelToDestroy?.destroy();
    @containerView.requestFocus();

  confirm: ->
    # if @hasError()
    #   return;

    @close();

    # serverManager = @containerView.getMain().getServerManager();
    # server = serverManager.addServer(@getFTPConfig());
    # @containerView.openDirectory(server.getInitialDirectory());

  cancel: ->
    @close();
