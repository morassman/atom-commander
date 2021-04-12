/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let SFTPDialog;
let fs = require('fs');
const fsp = require('fs-plus');
const SSH2 = require('ssh2');
const PathUtil = require('path');
const Utils = require('../utils');
const SFTPFileSystem = require('../fs/ftp/sftp-filesystem');
const {View, TextEditorView} = require('atom-space-pen-views');

module.exports =
(SFTPDialog = class SFTPDialog extends View {

  constructor() {
    super();
    this.ssh2 = null;
  }

  setParentDialog(parentDialog) {
    this.parentDialog = parentDialog;
  }

  static content() {
    return this.div({class: "atom-commander-ftp-dialog"}, () => {
      // @div "New SFTP Connection", {class: "heading"}
      this.table(() => {
        return this.tbody(() => {
          this.tr(() => {
            this.td("Name", {class: "text-highlight", style: "width:40%"});
            return this.td(() => {
              return this.subview("nameEditor", new TextEditorView({mini: true}));
            });
          });
          this.tr(() => {
            this.td("URL", {class: "text-highlight", style: "width:40%"});
            return this.td("sftp://", {outlet: "url", style: "padding-bottom: 0.5em"});
        });
          this.tr(() => {
            this.td("Host", {class: "text-highlight", style: "width:40%"});
            return this.td(() => {
              return this.subview("serverEditor", new TextEditorView({mini: true}));
            });
          });
          this.tr(() => {
            this.td("Port", {class: "text-highlight", style: "width:40%"});
            return this.td(() => {
              return this.subview("portEditor", new TextEditorView({mini: true}));
            });
          });
          this.tr(() => {
            this.td("Folder", {class: "text-highlight", style: "width:40%"});
            return this.td(() => {
              return this.subview("folderEditor", new TextEditorView({mini: true}));
            });
          });
          this.tr(() => {
            this.td("Username", {class: "text-highlight", style: "width:40%"});
            return this.td(() => {
              return this.subview("usernameEditor", new TextEditorView({mini: true}));
            });
          });
          this.tr(() => {
            this.td("Password", {class: "text-highlight", style: "width:40%"});
            return this.td(() => {
              this.div({class: "password"}, () => {
                return this.subview("passwordEditor", new TextEditorView({mini: true}));
              });
              return this.div("Leave empty to prompt for password", {class:"encrypted"});
          });
        });
          this.tr(() => {
            return this.td(() => {
              this.input({type: "radio", outlet: "loginWithPasswordCheckBox"});
              return this.span("Login with password", {class: "text-highlight", style: "margin-left:5px"});
          });
        });
          // @tr =>
          //   @td "Password", {class: "text-highlight indent", style: "width:40%"}
            // @td {class: "password"}, =>
              // @subview "passwordEditor", new TextEditorView(mini: true)
          this.tr(() => {
            return this.td(() => {
              this.input({type: "radio", outlet: "loginWithPrivateKeyCheckBox"});
              return this.span("Login with private key", {class: "text-highlight", style: "margin-left:5px"});
          });
        });
          this.tr(() => {
            this.td("Path to file", {class: "text-highlight indent", style: "width:40%"});
            return this.td(() => {
              return this.subview("privateKeyPathEditor", new TextEditorView({mini: true}));
            });
          });
          this.tr(() => {
            this.td({class: "indent", style: "width:40%"}, () => {
              this.input({type: "checkbox", outlet: "usePassphraseCheckBox"});
              return this.span("Use passphrase", {class: "text-highlight", style: "margin-left:5px"});
          });
            return this.td(() => {
              return this.div({class: "password"}, () => {
                return this.subview("passphraseEditor", new TextEditorView({mini: true}));
              });
            });
          });
          return this.tr(() => {
            this.td(() => {
              this.input({type: "checkbox", outlet: "storeCheckBox"});
              return this.span("Store password\\phrase", {class: "text-highlight", style: "width:40%; margin-left:5px"});
          });
            return this.td(() => {
              return this.span("These are encrypted", {class: "encrypted"});
          });
        });
      });
    });
      this.div({class: "test-button-panel"}, () => {
        return this.button("Test", {class: "btn", click: "test", outlet: "testButton"});
    });
      this.div({class: "bottom-button-panel"}, () => {
        this.button("Cancel", {class: "btn", click: "cancel", outlet: "cancelButton"});
        return this.button("OK", {class: "btn", click: "confirm", outlet: "okButton"});
    });
      return this.div(() => {
        this.span({class: "loading loading-spinner-tiny inline-block", outlet: "spinner"});
        return this.span({class: "message", outlet: "message"});
    });
  });
  }

  initialize() {
    this.nameEditor.attr("tabindex", 1);
    this.serverEditor.attr("tabindex", 2);
    this.portEditor.attr("tabindex", 3);
    this.folderEditor.attr("tabindex", 4);
    this.usernameEditor.attr("tabindex", 5);
    this.passwordEditor.attr("tabindex", 6);
    this.privateKeyPathEditor.attr("tabindex", 7);
    this.usePassphraseCheckBox.attr("tabindex", 8);
    this.passphraseEditor.attr("tabindex", 9);
    this.storeCheckBox.attr("tabindex", 10);
    this.testButton.attr("tabindex", 11);
    this.okButton.attr("tabindex", 12);
    this.cancelButton.attr("tabindex", 13);

    this.passwordEditor.addClass("password-editor");
    this.passphraseEditor.addClass("password-editor");

    this.spinner.hide();
    this.portEditor.getModel().setText("22");
    this.privateKeyPathEditor.getModel().setText(PathUtil.join("~", ".ssh", "id_rsa"));
    this.loginWithPasswordCheckBox.prop("checked", true);
    this.storeCheckBox.prop("checked", true);

    this.loginWithPasswordCheckBox.change(() => {
      this.loginWithPrivateKeyCheckBox.prop("checked", !this.isLoginWithPasswordSelected());
      return this.refreshError();
    });

    this.loginWithPrivateKeyCheckBox.change(() => {
      this.loginWithPasswordCheckBox.prop("checked", !this.isLoginWithPrivateKeySelected());
      return this.refreshError();
    });

    this.usePassphraseCheckBox.change(() => {
      return this.refreshError();
    });

    this.serverEditor.getModel().onDidChange(() => {
      this.refreshURL();
      return this.refreshError();
    });

    this.portEditor.getModel().onDidChange(() => {
      this.refreshURL();
      return this.refreshError();
    });

    this.folderEditor.getModel().onDidChange(() => {
      this.refreshURL();
      return this.refreshError();
    });

    this.usernameEditor.getModel().onDidChange(() => {
      return this.refreshError();
    });

    this.passwordEditor.getModel().onDidChange(() => {
      return this.refreshError();
    });

    this.privateKeyPathEditor.getModel().onDidChange(() => {
      return this.refreshError();
    });

    atom.commands.add(this.element, {
      "core:confirm": () => this.confirm(),
      "core:cancel": () => this.cancel()
    }
    );

    return this.refreshError();
  }

  // Populates the fields with an existing server's config. This is used
  // when editing a server.
  populateFields(config) {
    let {
      password
    } = config;
    let {
      passphrase
    } = config;

    if ((password == null)) {
      password = '';
    }

    if ((passphrase == null)) {
      passphrase = '';
    }

    this.nameEditor.getModel().setText(config.name);
    this.serverEditor.getModel().setText(config.host);
    this.portEditor.getModel().setText(config.port + "");
    this.folderEditor.getModel().setText(config.folder);
    this.usernameEditor.getModel().setText(config.username);
    this.passwordEditor.getModel().setText(password);
    this.privateKeyPathEditor.getModel().setText(config.privateKeyPath);
    this.passphraseEditor.getModel().setText(passphrase);
    this.storeCheckBox.prop("checked", config.storePassword);
    this.usePassphraseCheckBox.prop("checked", config.usePassphrase);
    this.loginWithPasswordCheckBox.prop("checked", config.loginWithPassword);
    this.loginWithPrivateKeyCheckBox.prop("checked", !config.loginWithPassword);

    this.refreshURL();
    return this.refreshError();
  }

  getPort() {
    let port = this.portEditor.getModel().getText().trim();

    if (port.length === 0) {
      return 22;
    }

    port = parseInt(port);

    if (isNaN(port)) {
      return null;
    }

    return port;
  }

  refreshURL() {
    const server = this.getServer();
    let port = this.portEditor.getModel().getText().trim();

    let url = "sftp://" + server;

    if (server.length > 0) {
      port = this.getPort();

      if ((port !== null) && (port !== 22)) {
        url += ":" + port;
      }
    }

    url += this.getFolder();
    return this.url.text(url);
  }

  refreshError() {
    const message = this.getErrorMessage();

    if (message === null) {
      return this.showMessage("", 0);
    } else {
      return this.showMessage(message, 2);
    }
  }

  getErrorMessage() {
    const server = this.getServer();
    if (server.length === 0) {
      return "Host must be specified.";
    }

    const username = this.getUsername();
    if (username.length === 0) {
      return "Username must be specified.";
    }

    const port = this.getPort();
    if (port === null) {
      return "Invalid port number.";
    }

    if (this.serverExists(server, port, username)) {
      return "This server has already been added.";
    }

    // if @isLoginWithPasswordSelected() and @getPassword().length == 0
    //   return "Password not specified."

    if (this.isLoginWithPrivateKeySelected()) {
      if (this.getPrivateKeyPath(false).length === 0) {
        return "Path to private key not specified.";
      } else if (!this.isPrivateKeyPathValid()) {
        return "Private key file not found.";
      }
    }

      // if @isUsePassphraseSelected() and @getPassphrase().length == 0
      //   return "Passphrase not specified.";

    return null;
  }

  showMessage(text, type) {
    this.messageType = type;

    this.message.removeClass("text-error");
    this.message.removeClass("text-warning");
    this.message.removeClass("text-success");

    if (this.messageType === 0) {
      this.message.addClass("text-success");
    } else if (this.messageType === 1) {
      this.message.addClass("text-warning");
    } else {
      this.message.addClass("text-error");
    }

    return this.message.text(text);
  }

  serverExists(server, port, username) {
    const id = "sftp_"+server+"_"+port+"_"+username;
    return this.parentDialog.serverExists(id);
  }

  getName() {
    return this.nameEditor.getModel().getText().trim();
  }

  getServer() {
    return this.serverEditor.getModel().getText().trim();
  }

  getFolder() {
    let folder = this.folderEditor.getModel().getText().trim();

    if (folder.length > 0) {
      if (folder[0] !== "/") {
        folder = "/"+folder;
      }
    } else {
      folder = "/";
    }

    return folder;
  }

  getUsername() {
    return this.usernameEditor.getModel().getText().trim();
  }

  getPassword() {
    return this.passwordEditor.getModel().getText().trim();
  }

  getPrivateKeyPath(resolve) {
    let path = this.privateKeyPathEditor.getModel().getText().trim();

    if (resolve) {
      path = Utils.resolveHome(path);
    }

    return path;
  }

  getPassphrase() {
    return this.passphraseEditor.getModel().getText().trim();
  }

  isLoginWithPasswordSelected() {
    return this.loginWithPasswordCheckBox.is(":checked");
  }

  isLoginWithPrivateKeySelected() {
    return this.loginWithPrivateKeyCheckBox.is(":checked");
  }

  isUsePassphraseSelected() {
    return this.usePassphraseCheckBox.is(":checked");
  }

  isPrivateKeyPathValid() {
    const path = this.getPrivateKeyPath(true);

    if (path.length === 0) {
      return false;
    }

    return fsp.isFileSync(path);
  }

  getPrivateKey() {
    if (!this.isPrivateKeyPathValid()) {
      return '';
    }

    return fs.readFileSync(this.getPrivateKeyPath(true), 'utf8');
  }

  isStoreCheckBoxSelected() {
    return this.storeCheckBox.is(":checked");
  }

  getSFTPConfig(testing) {
    const config = {};

    config.protocol = "sftp";
    config.name = this.getName();
    config.host = this.getServer();
    config.port = this.getPort();
    config.folder = this.getFolder();
    config.username = this.getUsername();
    config.password = this.getPassword();
    config.passwordDecrypted = true;
    config.storePassword = this.isStoreCheckBoxSelected();
    config.privateKeyPath = this.getPrivateKeyPath(false);
    config.passphrase = this.getPassphrase();
    config.loginWithPassword = this.isLoginWithPasswordSelected();
    config.usePassphrase = this.isUsePassphraseSelected();

    if (testing) {
      config.privateKey = this.getPrivateKey();
    }

    return config;
  }

  selected() {
    return this.nameEditor.focus();
  }
  // attach: ->
  //   @panel = atom.workspace.addModalPanel(item: this.element);
  //   @serverEditor.focus();
  //   @serverEditor.getModel().scrollToCursorPosition();

  close() {
    return this.parentDialog.close();
  }
    // panelToDestroy = @panel;
    // @panel = null;
    // panelToDestroy?.destroy();
    // @containerView.requestFocus();

  confirm() {
    if (this.hasError()) {
      return;
    }

    return this.parentDialog.addServer(this.getSFTPConfig(false));
  }

  cancel() {
    return this.parentDialog.close();
  }

  hasError() {
    return this.messageType === 2;
  }

  test() {
    if (this.hasError() || (this.ssh2 !== null)) {
      return;
    }

    const config = this.getSFTPConfig(false);
    fs = new SFTPFileSystem(this.parentDialog.getMain(), null, config);

    fs.onError(err => {
      this.parentDialog.attach();

      if (err.canceled) {
        this.showMessage("", 0);
      } else {
        this.showMessage("Connection failed. "+err.message, 1);
      }

      return fs.disconnect();
    });

    fs.onConnected(() => {
      this.parentDialog.attach();
      this.showMessage("Connection successful", 0);
      return fs.disconnect();
    });

    fs.onDisconnected(() => {
      return this.parentDialog.attach();
    });

    return fs.connect();
  }
});
