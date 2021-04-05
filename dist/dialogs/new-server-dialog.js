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
 * DS002: Fix invalid constructor
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var NewServerDialog;
var FTPDialog = require('./ftp-dialog');
var SFTPDialog = require('./sftp-dialog');
var View = require('atom-space-pen-views').View;
module.exports =
    (NewServerDialog = /** @class */ (function (_super) {
        __extends(NewServerDialog, _super);
        function NewServerDialog(containerView) {
            var _this = this;
            _this.containerView = containerView;
            _this = _super.call(this) || this;
            _this.ftpDialog.setParentDialog(_this);
            _this.sftpDialog.setParentDialog(_this);
            _this.currentDialog = _this.ftpDialog;
            _this.sftpDialog.detach();
            return _this;
        }
        NewServerDialog.content = function () {
            var _this = this;
            return this.div({ "class": "atom-commander-new-server-dialog" }, function () {
                _this.div("Add Server", { "class": "heading" });
                _this.div({ "class": "button-panel block" }, function () {
                    return _this.div({ "class": "btn-group" }, function () {
                        _this.button("FTP", { "class": "btn selected", outlet: "ftpButton", click: "ftpClicked" });
                        return _this.button("SFTP", { "class": "btn", outlet: "sftpButton", click: "sftpClicked" });
                    });
                });
                return _this.div({ outlet: "dialogContainer" }, function () {
                    _this.subview("ftpDialog", new FTPDialog());
                    return _this.subview("sftpDialog", new SFTPDialog());
                });
            });
        };
        // Called from the embedded dialog after it got initialized.
        // The dialog that was initialized. Either FTPDialog or SFTPDialog.
        NewServerDialog.prototype.dialogInitialized = function (dialog) { };
        NewServerDialog.prototype.getMain = function () {
            return this.containerView.getMain();
        };
        NewServerDialog.prototype.getServerManager = function () {
            return this.containerView.getMain().getServerManager();
        };
        NewServerDialog.prototype.serverExists = function (id) {
            return this.getServerManager().getFileSystemWithID(id) !== null;
        };
        NewServerDialog.prototype.ftpClicked = function () {
            return this.setSelected(this.ftpButton, this.ftpDialog);
        };
        NewServerDialog.prototype.sftpClicked = function () {
            return this.setSelected(this.sftpButton, this.sftpDialog);
        };
        NewServerDialog.prototype.setSelected = function (button, dialog) {
            this.ftpButton.removeClass("selected");
            this.sftpButton.removeClass("selected");
            button.addClass("selected");
            this.currentDialog.detach();
            this.currentDialog = dialog;
            this.currentDialog.appendTo(this.dialogContainer);
            return this.currentDialog.selected();
        };
        NewServerDialog.prototype.attach = function () {
            this.panel = atom.workspace.addModalPanel({ item: this.element });
            return this.currentDialog.selected();
        };
        NewServerDialog.prototype.addServer = function (config) {
            this.close();
            var serverManager = this.getServerManager();
            var server = serverManager.addServer(config);
            return this.containerView.openDirectory(server.getInitialDirectory());
        };
        NewServerDialog.prototype.close = function () {
            var panelToDestroy = this.panel;
            this.panel = null;
            if (panelToDestroy != null) {
                panelToDestroy.destroy();
            }
            return this.containerView.requestFocus();
        };
        return NewServerDialog;
    }(View)));
//# sourceMappingURL=new-server-dialog.js.map