/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let FTPDialog;
const Client = require('ftp');
const FTPFileSystem = require('../fs/ftp/ftp-filesystem');
const {View, TextEditorView} = require('atom-space-pen-views');

module.exports =
(FTPDialog = class FTPDialog extends View {

  constructor() {
    super();
    this.username = "";
    this.client = null;
  }

  setParentDialog(parentDialog) {
    this.parentDialog = parentDialog;
  }

  static content() {
    return this.div({class: "atom-commander-ftp-dialog"}, () => {
      // @div "New FTP Connection", {class: "heading"}
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
            return this.td("ftp://", {outlet: "url", style: "padding-bottom: 0.5em"});
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
            return this.td(() => {
              this.input({type: "checkbox", outlet: "anonymous"});
              return this.span("Anonymous", {class: "text-highlight", style: "margin-left:5px"});
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
              return this.div({class: "password"}, () => {
                return this.subview("passwordEditor", new TextEditorView({mini: true}));
              });
            });
          });
          this.tr(() => {
            this.td("");
            return this.td("Leave empty to prompt for password", {class:"encrypted"});
        });
          return this.tr(() => {
            this.td(() => {
              this.input({type: "checkbox", outlet: "storeCheckBox"});
              return this.span("Store password", {class: "text-highlight", style: "margin-left:5px"});
          });
            return this.td(() => {
              return this.span("Passwords are encrypted", {class: "encrypted"});
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
    this.anonymous.attr("tabindex", 5);
    this.usernameEditor.attr("tabindex", 6);
    this.passwordEditor.attr("tabindex", 7);
    this.storeCheckBox.attr("tabindex", 8);
    this.testButton.attr("tabindex", 9);
    this.okButton.attr("tabindex", 10);
    this.cancelButton.attr("tabindex", 11);

    this.passwordEditor.addClass("password-editor");

    this.spinner.hide();
    this.portEditor.getModel().setText("21");
    this.storeCheckBox.prop("checked", true);

    this.serverEditor.getModel().onDidChange(() => {
      this.refreshURL();
      return this.refreshError();
    });

    this.portEditor.getModel().onDidChange(() => {
      this.refreshURL();
      return this.refreshError();
    });

    this.folderEditor.getModel().onDidChange(() => {
      return this.refreshURL();
    });

    this.usernameEditor.getModel().onDidChange(() => {
      if (!this.isAnonymousSelected()) {
        this.username = this.usernameEditor.getModel().getText().trim();
      }
      return this.refreshError();
    });

    this.passwordEditor.getModel().onDidChange(() => {
      return this.refreshError();
    });

    this.anonymous.change(() => {
      return this.anonymousChanged();
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

    if ((password == null)) {
      password = "";
    }

    this.nameEditor.getModel().setText(config.name);
    this.serverEditor.getModel().setText(config.host);
    this.portEditor.getModel().setText(config.port + "");
    this.usernameEditor.getModel().setText(config.user);
    this.passwordEditor.getModel().setText(password);
    this.folderEditor.getModel().setText(config.folder);
    this.anonymous.prop("checked", config.anonymous);
    return this.storeCheckBox.prop("checked", config.storePassword);
  }

  getPort() {
    let port = this.portEditor.getModel().getText().trim();

    if (port.length === 0) {
      return 21;
    }

    port = parseInt(port);

    if (isNaN(port)) {
      return null;
    }

    return port;
  }

  anonymousChanged() {
    const selected = this.isAnonymousSelected();

    if (selected) {
      this.usernameEditor.getModel().setText("anonymous");
    } else {
      this.usernameEditor.getModel().setText(this.username);
    }

    return this.refreshError();
  }

  isAnonymousSelected() {
    return this.anonymous.is(":checked");
  }

  isStoreCheckBoxSelected() {
    return this.storeCheckBox.is(":checked");
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

  refreshURL() {
    const server = this.serverEditor.getModel().getText().trim();
    let port = this.portEditor.getModel().getText().trim();

    let url = "ftp://" + server;

    if (server.length > 0) {
      port = this.getPort();

      if ((port !== null) && (port !== 21)) {
        url += ":" + port;
      }
    }

    url += this.getFolder();
    return this.url.text(url);
  }

  refreshError() {
    let message = this.getErrorMessage();

    if (message !== null) {
      this.showMessage(message, 2);
      return;
    }

    message = this.getWarningMessage();

    if (message !== null) {
      this.showMessage(message, 1);
      return;
    }

    return this.showMessage("", 0);
  }

  getErrorMessage() {
    const server = this.getServer();
    if (server.length === 0) {
      return "Host must be specified.";
    }

    const port = this.getPort();
    if (port === null) {
      return "Invalid port number.";
    }

    if (this.serverExists(server, port, this.getUsername())) {
      return "This server has already been added.";
    }

    return null;
  }

  getWarningMessage() {
    if (!this.isAnonymousSelected()) {
      if (this.passwordEditor.getModel().getText().trim().length === 0) {
        return "Password not specified.";
      }
    }

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
    const id = "ftp_"+server+"_"+port+"_"+username;
    return this.parentDialog.serverExists(id);
  }

  getName() {
    return this.nameEditor.getModel().getText().trim();
  }

  getServer() {
    return this.serverEditor.getModel().getText().trim();
  }

  getUsername() {
    return this.usernameEditor.getModel().getText().trim();
  }

  getFTPConfig() {
    const config = {};

    config.protocol = "ftp";
    config.name = this.getName();
    config.host = this.getServer();
    config.port = this.getPort();
    config.folder = this.getFolder();
    config.passwordDecrypted = true;

    if (this.isAnonymousSelected()) {
      config.anonymous = true;
      config.user = this.getUsername();
      config.password = "anonymous@";
      config.storePassword = true;
    } else {
      config.anonymous = false;
      config.user = this.getUsername();
      config.password = this.passwordEditor.getModel().getText().trim();
      config.storePassword = this.isStoreCheckBoxSelected();
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

    const config = this.getFTPConfig();

    if (!config.storePassword && (config.password.length === 0)) {
      delete config.password;
    }

    return this.parentDialog.addServer(config);
  }

  cancel() {
    return this.parentDialog.close();
  }

  hasError() {
    return this.messageType === 2;
  }

  test() {
    if (this.hasError() || (this.client !== null)) {
      return;
    }

    this.client = new Client();

    this.client.on("ready", () => {
      this.spinner.hide();
      this.showMessage("Connection successful", 0);
      if (this.client !== null) {
        this.client.end();
        return this.client = null;
      }
    });

    this.client.on("error", err => {
      this.spinner.hide();
      this.showMessage("Connection failed", 1);
      if (this.client !== null) {
        this.client.end();
        return this.client = null;
      }
    });

    this.spinner.show();
    return this.client.connect(this.getFTPConfig());
  }
});
