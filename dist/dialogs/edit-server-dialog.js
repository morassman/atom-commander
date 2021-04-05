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
var EditServerDialog;
var FTPDialog = require('./ftp-dialog');
var SFTPDialog = require('./sftp-dialog');
var View = require('atom-space-pen-views').View;
module.exports =
    (EditServerDialog = /** @class */ (function (_super) {
        __extends(EditServerDialog, _super);
        // @server: The Server to edit.
        function EditServerDialog(server) {
            var _this = this;
            _this.server = server;
            _this = _super.call(this) || this;
            _this.ftpDialog.setParentDialog(_this);
            _this.sftpDialog.setParentDialog(_this);
            _this.currentDialog = _this.ftpDialog;
            _this.sftpDialog.detach();
            if (_this.server.isFTP()) {
                _this.ftpDialog.populateFields(_this.server.getConfig());
                _this.setSelected(_this.ftpDialog);
            }
            else if (_this.server.isSFTP()) {
                _this.sftpDialog.populateFields(_this.server.getConfig());
                _this.setSelected(_this.sftpDialog);
            }
            return _this;
        }
        EditServerDialog.content = function () {
            var _this = this;
            return this.div({ "class": "atom-commander-new-server-dialog" }, function () {
                _this.div("Edit Server", { "class": "heading" });
                return _this.div({ outlet: "dialogContainer" }, function () {
                    _this.subview("ftpDialog", new FTPDialog());
                    return _this.subview("sftpDialog", new SFTPDialog());
                });
            });
        };
        EditServerDialog.prototype.getServerManager = function () {
            return this.server.getServerManager();
        };
        EditServerDialog.prototype.getMain = function () {
            return this.server.getServerManager().getMain();
        };
        EditServerDialog.prototype.serverExists = function (id) {
            var fs = this.getServerManager().getFileSystemWithID(id);
            if ((fs == null)) {
                return false;
            }
            return fs !== this.server.getFileSystem();
        };
        EditServerDialog.prototype.setSelected = function (dialog) {
            this.currentDialog.detach();
            this.currentDialog = dialog;
            this.currentDialog.appendTo(this.dialogContainer);
            return this.currentDialog.selected();
        };
        EditServerDialog.prototype.attach = function () {
            this.panel = atom.workspace.addModalPanel({ item: this.element });
            return this.currentDialog.selected();
        };
        EditServerDialog.prototype.addServer = function (config) {
            this.close();
            var serverManager = this.getServerManager();
            return serverManager.changeServerConfig(this.server, config);
        };
        EditServerDialog.prototype.close = function () {
            var panelToDestroy = this.panel;
            this.panel = null;
            return (panelToDestroy != null ? panelToDestroy.destroy() : undefined);
        };
        return EditServerDialog;
    }(View)));
//# sourceMappingURL=edit-server-dialog.js.map