FTPDialog = require './ftp-dialog'
SFTPDialog = require './sftp-dialog'
{View} = require 'atom-space-pen-views'

module.exports =
class EditServerDialog extends View

  # @server: The Server to edit.
  constructor: (@server) ->
    super();
    @ftpDialog.setParentDialog(@);
    @sftpDialog.setParentDialog(@);
    @currentDialog = @ftpDialog;
    @sftpDialog.detach();

    if @server.isFTP()
      @ftpDialog.populateFields(@server.getConfig());
      @setSelected(@ftpDialog);
    else if @server.isSFTP()
      @sftpDialog.populateFields(@server.getConfig());
      @setSelected(@sftpDialog);

  @content: ->
    @div class: "atom-commander-new-server-dialog", =>
      @div "Edit Server", {class: "heading"}
      @div {outlet: "dialogContainer"}, =>
        @subview "ftpDialog", new FTPDialog()
        @subview "sftpDialog", new SFTPDialog()

  getServerManager: ->
    return @server.getServerManager();

  serverExists: (id) ->
    fs = @getServerManager().getFileSystemWithID(id);

    if !fs?
      return false;

    return fs != @server.getFileSystem();

  setSelected: (dialog) ->
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
    serverManager.changeServerConfig(@server, config);

  close: ->
    panelToDestroy = @panel;
    @panel = null;
    panelToDestroy?.destroy();
