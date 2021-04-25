/*
 * decaffeinate suggestions:
 * DS002: Fix invalid constructor
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let EditServerDialog;
const FTPDialog = require('./ftp-dialog');
const SFTPDialog = require('./sftp-dialog');
const {View} = require('atom-space-pen-views');

module.exports =
(EditServerDialog = class EditServerDialog extends View {

  // @server: The Server to edit.
  constructor(server) {
    this.server = server;
    super();
    this.ftpDialog.setParentDialog(this);
    this.sftpDialog.setParentDialog(this);
    this.currentDialog = this.ftpDialog;
    this.sftpDialog.detach();

    if (this.server.isFTP()) {
      this.ftpDialog.populateFields(this.server.getConfig());
      this.setSelected(this.ftpDialog);
    } else if (this.server.isSFTP()) {
      this.sftpDialog.populateFields(this.server.getConfig());
      this.setSelected(this.sftpDialog);
    }
  }

  static content() {
    return this.div({class: "atom-commander-edit-server-dialog"}, () => {
      this.div("Edit Server", {class: "heading"});
      return this.div({outlet: "dialogContainer"}, () => {
        this.subview("ftpDialog", new FTPDialog());
        return this.subview("sftpDialog", new SFTPDialog());
      });
    });
  }

  getServerManager() {
    return this.server.getServerManager();
  }

  getMain() {
    return this.server.getServerManager().getMain();
  }

  serverExists(id) {
    const fs = this.getServerManager().getFileSystemWithID(id);

    if ((fs == null)) {
      return false;
    }

    return fs !== this.server.getFileSystem();
  }

  setSelected(dialog) {
    this.currentDialog.detach();
    this.currentDialog = dialog;
    this.currentDialog.appendTo(this.dialogContainer);
    return this.currentDialog.selected();
  }

  attach() {
    this.panel = atom.workspace.addModalPanel({item: this.element});
    return this.currentDialog.selected();
  }

  addServer(config) {
    this.close();
    const serverManager = this.getServerManager();
    return serverManager.changeServerConfig(this.server, config);
  }

  close() {
    const panelToDestroy = this.panel;
    this.panel = null;
    return (panelToDestroy != null ? panelToDestroy.destroy() : undefined);
  }
});
