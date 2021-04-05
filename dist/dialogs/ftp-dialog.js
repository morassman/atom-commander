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
var FTPDialog;
var Client = require('ftp');
var FTPFileSystem = require('../fs/ftp/ftp-filesystem');
var _a = require('atom-space-pen-views'), View = _a.View, TextEditorView = _a.TextEditorView;
module.exports =
    (FTPDialog = /** @class */ (function (_super) {
        __extends(FTPDialog, _super);
        function FTPDialog() {
            var _this = _super.call(this) || this;
            _this.username = "";
            _this.client = null;
            return _this;
        }
        FTPDialog.prototype.setParentDialog = function (parentDialog) {
            this.parentDialog = parentDialog;
        };
        FTPDialog.content = function () {
            var _this = this;
            return this.div({ "class": "atom-commander-ftp-dialog" }, function () {
                // @div "New FTP Connection", {class: "heading"}
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
                            return _this.td("ftp://", { outlet: "url", style: "padding-bottom: 0.5em" });
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
                            return _this.td(function () {
                                _this.input({ type: "checkbox", outlet: "anonymous" });
                                return _this.span("Anonymous", { "class": "text-highlight", style: "margin-left:5px" });
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
                                return _this.div({ "class": "password" }, function () {
                                    return _this.subview("passwordEditor", new TextEditorView({ mini: true }));
                                });
                            });
                        });
                        _this.tr(function () {
                            _this.td("");
                            return _this.td("Leave empty to prompt for password", { "class": "encrypted" });
                        });
                        return _this.tr(function () {
                            _this.td(function () {
                                _this.input({ type: "checkbox", outlet: "storeCheckBox" });
                                return _this.span("Store password", { "class": "text-highlight", style: "margin-left:5px" });
                            });
                            return _this.td(function () {
                                return _this.span("Passwords are encrypted", { "class": "encrypted" });
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
        FTPDialog.prototype.initialize = function () {
            var _this = this;
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
            this.serverEditor.getModel().onDidChange(function () {
                _this.refreshURL();
                return _this.refreshError();
            });
            this.portEditor.getModel().onDidChange(function () {
                _this.refreshURL();
                return _this.refreshError();
            });
            this.folderEditor.getModel().onDidChange(function () {
                return _this.refreshURL();
            });
            this.usernameEditor.getModel().onDidChange(function () {
                if (!_this.isAnonymousSelected()) {
                    _this.username = _this.usernameEditor.getModel().getText().trim();
                }
                return _this.refreshError();
            });
            this.passwordEditor.getModel().onDidChange(function () {
                return _this.refreshError();
            });
            this.anonymous.change(function () {
                return _this.anonymousChanged();
            });
            atom.commands.add(this.element, {
                "core:confirm": function () { return _this.confirm(); },
                "core:cancel": function () { return _this.cancel(); }
            });
            return this.refreshError();
        };
        // Populates the fields with an existing server's config. This is used
        // when editing a server.
        FTPDialog.prototype.populateFields = function (config) {
            var password = config.password;
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
        };
        FTPDialog.prototype.getPort = function () {
            var port = this.portEditor.getModel().getText().trim();
            if (port.length === 0) {
                return 21;
            }
            port = parseInt(port);
            if (isNaN(port)) {
                return null;
            }
            return port;
        };
        FTPDialog.prototype.anonymousChanged = function () {
            var selected = this.isAnonymousSelected();
            if (selected) {
                this.usernameEditor.getModel().setText("anonymous");
            }
            else {
                this.usernameEditor.getModel().setText(this.username);
            }
            return this.refreshError();
        };
        FTPDialog.prototype.isAnonymousSelected = function () {
            return this.anonymous.is(":checked");
        };
        FTPDialog.prototype.isStoreCheckBoxSelected = function () {
            return this.storeCheckBox.is(":checked");
        };
        FTPDialog.prototype.getFolder = function () {
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
        FTPDialog.prototype.refreshURL = function () {
            var server = this.serverEditor.getModel().getText().trim();
            var port = this.portEditor.getModel().getText().trim();
            var url = "ftp://" + server;
            if (server.length > 0) {
                port = this.getPort();
                if ((port !== null) && (port !== 21)) {
                    url += ":" + port;
                }
            }
            url += this.getFolder();
            return this.url.text(url);
        };
        FTPDialog.prototype.refreshError = function () {
            var message = this.getErrorMessage();
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
        };
        FTPDialog.prototype.getErrorMessage = function () {
            var server = this.getServer();
            if (server.length === 0) {
                return "Host must be specified.";
            }
            var port = this.getPort();
            if (port === null) {
                return "Invalid port number.";
            }
            if (this.serverExists(server, port, this.getUsername())) {
                return "This server has already been added.";
            }
            return null;
        };
        FTPDialog.prototype.getWarningMessage = function () {
            if (!this.isAnonymousSelected()) {
                if (this.passwordEditor.getModel().getText().trim().length === 0) {
                    return "Password not specified.";
                }
            }
            return null;
        };
        FTPDialog.prototype.showMessage = function (text, type) {
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
        FTPDialog.prototype.serverExists = function (server, port, username) {
            var id = "ftp_" + server + "_" + port + "_" + username;
            return this.parentDialog.serverExists(id);
        };
        FTPDialog.prototype.getName = function () {
            return this.nameEditor.getModel().getText().trim();
        };
        FTPDialog.prototype.getServer = function () {
            return this.serverEditor.getModel().getText().trim();
        };
        FTPDialog.prototype.getUsername = function () {
            return this.usernameEditor.getModel().getText().trim();
        };
        FTPDialog.prototype.getFTPConfig = function () {
            var config = {};
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
            }
            else {
                config.anonymous = false;
                config.user = this.getUsername();
                config.password = this.passwordEditor.getModel().getText().trim();
                config.storePassword = this.isStoreCheckBoxSelected();
            }
            return config;
        };
        FTPDialog.prototype.selected = function () {
            return this.nameEditor.focus();
        };
        // attach: ->
        //   @panel = atom.workspace.addModalPanel(item: this.element);
        //   @serverEditor.focus();
        //   @serverEditor.getModel().scrollToCursorPosition();
        FTPDialog.prototype.close = function () {
            return this.parentDialog.close();
        };
        // panelToDestroy = @panel;
        // @panel = null;
        // panelToDestroy?.destroy();
        // @containerView.requestFocus();
        FTPDialog.prototype.confirm = function () {
            if (this.hasError()) {
                return;
            }
            var config = this.getFTPConfig();
            if (!config.storePassword && (config.password.length === 0)) {
                delete config.password;
            }
            return this.parentDialog.addServer(config);
        };
        FTPDialog.prototype.cancel = function () {
            return this.parentDialog.close();
        };
        FTPDialog.prototype.hasError = function () {
            return this.messageType === 2;
        };
        FTPDialog.prototype.test = function () {
            var _this = this;
            if (this.hasError() || (this.client !== null)) {
                return;
            }
            this.client = new Client();
            this.client.on("ready", function () {
                _this.spinner.hide();
                _this.showMessage("Connection successful", 0);
                if (_this.client !== null) {
                    _this.client.end();
                    return _this.client = null;
                }
            });
            this.client.on("error", function (err) {
                _this.spinner.hide();
                _this.showMessage("Connection failed", 1);
                if (_this.client !== null) {
                    _this.client.end();
                    return _this.client = null;
                }
            });
            this.spinner.show();
            return this.client.connect(this.getFTPConfig());
        };
        return FTPDialog;
    }(View)));
//# sourceMappingURL=ftp-dialog.js.map