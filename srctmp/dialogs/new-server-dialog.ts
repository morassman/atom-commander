/*
 * decaffeinate suggestions:
 * DS002: Fix invalid constructor
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let NewServerDialog;
const FTPDialog = require('./ftp-dialog');
const SFTPDialog = require('./sftp-dialog');
const {View} = require('atom-space-pen-views');

module.exports =
(NewServerDialog = class NewServerDialog extends View {

  constructor(containerView) {
    this.containerView = containerView;
    super();
    this.ftpDialog.setParentDialog(this);
    this.sftpDialog.setParentDialog(this);
    this.currentDialog = this.ftpDialog;
    this.sftpDialog.detach();
  }

  static content() {
    return this.div({class: "atom-commander-edit-server-dialog"}, () => {
      this.div("Add Server", {class: "heading"});
      this.div({class: "button-panel block"}, () => {
        return this.div({class: "btn-group"}, () => {
          this.button("FTP", {class: "btn selected", outlet: "ftpButton", click: "ftpClicked"});
          return this.button("SFTP", {class: "btn", outlet: "sftpButton", click: "sftpClicked"});
      });
    });
      return this.div({outlet: "dialogContainer"}, () => {
        this.subview("ftpDialog", new FTPDialog());
        return this.subview("sftpDialog", new SFTPDialog());
      });
    });
  }

  // Called from the embedded dialog after it got initialized.
  // The dialog that was initialized. Either FTPDialog or SFTPDialog.
  dialogInitialized(dialog) {}

  getMain() {
    return this.containerView.getMain();
  }

  getServerManager() {
    return this.containerView.getMain().getServerManager();
  }

  serverExists(id) {
    return this.getServerManager().getFileSystemWithID(id) !== null;
  }

  ftpClicked() {
    return this.setSelected(this.ftpButton, this.ftpDialog);
  }

  sftpClicked() {
    return this.setSelected(this.sftpButton, this.sftpDialog);
  }

  setSelected(button, dialog) {
    this.ftpButton.removeClass("selected");
    this.sftpButton.removeClass("selected");
    button.addClass("selected");

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
    const server = serverManager.addServer(config);
    return this.containerView.openDirectory(server.getInitialDirectory());
  }

  close() {
    const panelToDestroy = this.panel;
    this.panel = null;
    if (panelToDestroy != null) {
      panelToDestroy.destroy();
    }
    return this.containerView.requestFocus();
  }
});
