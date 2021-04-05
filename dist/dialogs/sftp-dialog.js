var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var SFTPDialog;
var fs = require('fs');
var fsp = require('fs-plus');
var SSH2 = require('ssh2');
var PathUtil = require('path');
var Utils = require('../utils');
var SFTPFileSystem = require('../fs/ftp/sftp-filesystem');
var _a = require('atom-space-pen-views'), View = _a.View, TextEditorView = _a.TextEditorView;
module.exports =
    (SFTPDialog = /** @class */ (function (_super) {
        __extends(SFTPDialog, _super);
        function SFTPDialog() {
            var _this = _super.call(this) || this;
            _this.ssh2 = null;
            return _this;
        }
        SFTPDialog.prototype.setParentDialog = function (parentDialog) {
            this.parentDialog = parentDialog;
        };
        SFTPDialog.content = function () {
            var _this = this;
            return this.div({ "class": "atom-commander-ftp-dialog" }, function () {
                // @div "New SFTP Connection", {class: "heading"}
                _this.table(function () {
                    return _this.tbody(function () {
                        _this.tr(function () {
                            _this.td("Name", { "class": "text-highlight", style: "width:40%" });
                            return _this.td(function () {
                                return _this.subview("nameEditor", new TextEditorView({ mini: true }));
                            });
                        });
                        _this.tr(function () {
                            _this.td("URL", { "class": "text-highlight", style: "width:40%" });
                            return _this.td("sftp://", { outlet: "url", style: "padding-bottom: 0.5em" });
                        });
                        _this.tr(function () {
                            _this.td("Host", { "class": "text-highlight", style: "width:40%" });
                            return _this.td(function () {
                                return _this.subview("serverEditor", new TextEditorView({ mini: true }));
                            });
                        });
                        _this.tr(function () {
                            _this.td("Port", { "class": "text-highlight", style: "width:40%" });
                            return _this.td(function () {
                                return _this.subview("portEditor", new TextEditorView({ mini: true }));
                            });
                        });
                        _this.tr(function () {
                            _this.td("Folder", { "class": "text-highlight", style: "width:40%" });
                            return _this.td(function () {
                                return _this.subview("folderEditor", new TextEditorView({ mini: true }));
                            });
                        });
                        _this.tr(function () {
                            _this.td("Username", { "class": "text-highlight", style: "width:40%" });
                            return _this.td(function () {
                                return _this.subview("usernameEditor", new TextEditorView({ mini: true }));
                            });
                        });
                        _this.tr(function () {
                            _this.td("Password", { "class": "text-highlight", style: "width:40%" });
                            return _this.td(function () {
                                _this.div({ "class": "password" }, function () {
                                    return _this.subview("passwordEditor", new TextEditorView({ mini: true }));
                                });
                                return _this.div("Leave empty to prompt for password", { "class": "encrypted" });
                            });
                        });
                        _this.tr(function () {
                            return _this.td(function () {
                                _this.input({ type: "radio", outlet: "loginWithPasswordCheckBox" });
                                return _this.span("Login with password", { "class": "text-highlight", style: "margin-left:5px" });
                            });
                        });
                        // @tr =>
                        //   @td "Password", {class: "text-highlight indent", style: "width:40%"}
                        // @td {class: "password"}, =>
                        // @subview "passwordEditor", new TextEditorView(mini: true)
                        _this.tr(function () {
                            return _this.td(function () {
                                _this.input({ type: "radio", outlet: "loginWithPrivateKeyCheckBox" });
                                return _this.span("Login with private key", { "class": "text-highlight", style: "margin-left:5px" });
                            });
                        });
                        _this.tr(function () {
                            _this.td("Path to file", { "class": "text-highlight indent", style: "width:40%" });
                            return _this.td(function () {
                                return _this.subview("privateKeyPathEditor", new TextEditorView({ mini: true }));
                            });
                        });
                        _this.tr(function () {
                            _this.td({ "class": "indent", style: "width:40%" }, function () {
                                _this.input({ type: "checkbox", outlet: "usePassphraseCheckBox" });
                                return _this.span("Use passphrase", { "class": "text-highlight", style: "margin-left:5px" });
                            });
                            return _this.td(function () {
                                return _this.div({ "class": "password" }, function () {
                                    return _this.subview("passphraseEditor", new TextEditorView({ mini: true }));
                                });
                            });
                        });
                        return _this.tr(function () {
                            _this.td(function () {
                                _this.input({ type: "checkbox", outlet: "storeCheckBox" });
                                return _this.span("Store password\\phrase", { "class": "text-highlight", style: "width:40%; margin-left:5px" });
                            });
                            return _this.td(function () {
                                return _this.span("These are encrypted", { "class": "encrypted" });
                            });
                        });
                    });
                });
                _this.div({ "class": "test-button-panel" }, function () {
                    return _this.button("Test", { "class": "btn", click: "test", outlet: "testButton" });
                });
                _this.div({ "class": "bottom-button-panel" }, function () {
                    _this.button("Cancel", { "class": "btn", click: "cancel", outlet: "cancelButton" });
                    return _this.button("OK", { "class": "btn", click: "confirm", outlet: "okButton" });
                });
                return _this.div(function () {
                    _this.span({ "class": "loading loading-spinner-tiny inline-block", outlet: "spinner" });
                    return _this.span({ "class": "message", outlet: "message" });
                });
            });
        };
        SFTPDialog.prototype.initialize = function () {
            var _this = this;
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
            this.loginWithPasswordCheckBox.change(function () {
                _this.loginWithPrivateKeyCheckBox.prop("checked", !_this.isLoginWithPasswordSelected());
                return _this.refreshError();
            });
            this.loginWithPrivateKeyCheckBox.change(function () {
                _this.loginWithPasswordCheckBox.prop("checked", !_this.isLoginWithPrivateKeySelected());
                return _this.refreshError();
            });
            this.usePassphraseCheckBox.change(function () {
                return _this.refreshError();
            });
            this.serverEditor.getModel().onDidChange(function () {
                _this.refreshURL();
                return _this.refreshError();
            });
            this.portEditor.getModel().onDidChange(function () {
                _this.refreshURL();
                return _this.refreshError();
            });
            this.folderEditor.getModel().onDidChange(function () {
                _this.refreshURL();
                return _this.refreshError();
            });
            this.usernameEditor.getModel().onDidChange(function () {
                return _this.refreshError();
            });
            this.passwordEditor.getModel().onDidChange(function () {
                return _this.refreshError();
            });
            this.privateKeyPathEditor.getModel().onDidChange(function () {
                return _this.refreshError();
            });
            atom.commands.add(this.element, {
                "core:confirm": function () { return _this.confirm(); },
                "core:cancel": function () { return _this.cancel(); }
            });
            return this.refreshError();
        };
        // Populates the fields with an existing server's config. This is used
        // when editing a server.
        SFTPDialog.prototype.populateFields = function (config) {
            var password = config.password;
            var passphrase = config.passphrase;
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
        };
        SFTPDialog.prototype.getPort = function () {
            var port = this.portEditor.getModel().getText().trim();
            if (port.length === 0) {
                return 22;
            }
            port = parseInt(port);
            if (isNaN(port)) {
                return null;
            }
            return port;
        };
        SFTPDialog.prototype.refreshURL = function () {
            var server = this.getServer();
            var port = this.portEditor.getModel().getText().trim();
            var url = "sftp://" + server;
            if (server.length > 0) {
                port = this.getPort();
                if ((port !== null) && (port !== 22)) {
                    url += ":" + port;
                }
            }
            url += this.getFolder();
            return this.url.text(url);
        };
        SFTPDialog.prototype.refreshError = function () {
            var message = this.getErrorMessage();
            if (message === null) {
                return this.showMessage("", 0);
            }
            else {
                return this.showMessage(message, 2);
            }
        };
        SFTPDialog.prototype.getErrorMessage = function () {
            var server = this.getServer();
            if (server.length === 0) {
                return "Host must be specified.";
            }
            var username = this.getUsername();
            if (username.length === 0) {
                return "Username must be specified.";
            }
            var port = this.getPort();
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
                }
                else if (!this.isPrivateKeyPathValid()) {
                    return "Private key file not found.";
                }
            }
            // if @isUsePassphraseSelected() and @getPassphrase().length == 0
            //   return "Passphrase not specified.";
            return null;
        };
        SFTPDialog.prototype.showMessage = function (text, type) {
            this.messageType = type;
            this.message.removeClass("text-error");
            this.message.removeClass("text-warning");
            this.message.removeClass("text-success");
            if (this.messageType === 0) {
                this.message.addClass("text-success");
            }
            else if (this.messageType === 1) {
                this.message.addClass("text-warning");
            }
            else {
                this.message.addClass("text-error");
            }
            return this.message.text(text);
        };
        SFTPDialog.prototype.serverExists = function (server, port, username) {
            var id = "sftp_" + server + "_" + port + "_" + username;
            return this.parentDialog.serverExists(id);
        };
        SFTPDialog.prototype.getName = function () {
            return this.nameEditor.getModel().getText().trim();
        };
        SFTPDialog.prototype.getServer = function () {
            return this.serverEditor.getModel().getText().trim();
        };
        SFTPDialog.prototype.getFolder = function () {
            var folder = this.folderEditor.getModel().getText().trim();
            if (folder.length > 0) {
                if (folder[0] !== "/") {
                    folder = "/" + folder;
                }
            }
            else {
                folder = "/";
            }
            return folder;
        };
        SFTPDialog.prototype.getUsername = function () {
            return this.usernameEditor.getModel().getText().trim();
        };
        SFTPDialog.prototype.getPassword = function () {
            return this.passwordEditor.getModel().getText().trim();
        };
        SFTPDialog.prototype.getPrivateKeyPath = function (resolve) {
            var path = this.privateKeyPathEditor.getModel().getText().trim();
            if (resolve) {
                path = Utils.resolveHome(path);
            }
            return path;
        };
        SFTPDialog.prototype.getPassphrase = function () {
            return this.passphraseEditor.getModel().getText().trim();
        };
        SFTPDialog.prototype.isLoginWithPasswordSelected = function () {
            return this.loginWithPasswordCheckBox.is(":checked");
        };
        SFTPDialog.prototype.isLoginWithPrivateKeySelected = function () {
            return this.loginWithPrivateKeyCheckBox.is(":checked");
        };
        SFTPDialog.prototype.isUsePassphraseSelected = function () {
            return this.usePassphraseCheckBox.is(":checked");
        };
        SFTPDialog.prototype.isPrivateKeyPathValid = function () {
            var path = this.getPrivateKeyPath(true);
            if (path.length === 0) {
                return false;
            }
            return fsp.isFileSync(path);
        };
        SFTPDialog.prototype.getPrivateKey = function () {
            if (!this.isPrivateKeyPathValid()) {
                return '';
            }
            return fs.readFileSync(this.getPrivateKeyPath(true), 'utf8');
        };
        SFTPDialog.prototype.isStoreCheckBoxSelected = function () {
            return this.storeCheckBox.is(":checked");
        };
        SFTPDialog.prototype.getSFTPConfig = function (testing) {
            var config = {};
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
        };
        SFTPDialog.prototype.selected = function () {
            return this.nameEditor.focus();
        };
        // attach: ->
        //   @panel = atom.workspace.addModalPanel(item: this.element);
        //   @serverEditor.focus();
        //   @serverEditor.getModel().scrollToCursorPosition();
        SFTPDialog.prototype.close = function () {
            return this.parentDialog.close();
        };
        // panelToDestroy = @panel;
        // @panel = null;
        // panelToDestroy?.destroy();
        // @containerView.requestFocus();
        SFTPDialog.prototype.confirm = function () {
            if (this.hasError()) {
                return;
            }
            return this.parentDialog.addServer(this.getSFTPConfig(false));
        };
        SFTPDialog.prototype.cancel = function () {
            return this.parentDialog.close();
        };
        SFTPDialog.prototype.hasError = function () {
            return this.messageType === 2;
        };
        SFTPDialog.prototype.test = function () {
            var _this = this;
            if (this.hasError() || (this.ssh2 !== null)) {
                return;
            }
            var config = this.getSFTPConfig(false);
            fs = new SFTPFileSystem(this.parentDialog.getMain(), null, config);
            fs.onError(function (err) {
                _this.parentDialog.attach();
                if (err.canceled) {
                    _this.showMessage("", 0);
                }
                else {
                    _this.showMessage("Connection failed. " + err.message, 1);
                }
                return fs.disconnect();
            });
            fs.onConnected(function () {
                _this.parentDialog.attach();
                _this.showMessage("Connection successful", 0);
                return fs.disconnect();
            });
            fs.onDisconnected(function () {
                return _this.parentDialog.attach();
            });
            return fs.connect();
        };
        return SFTPDialog;
    }(View)));
//# sourceMappingURL=sftp-dialog.js.map