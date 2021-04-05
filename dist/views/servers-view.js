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
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var ServersView;
var CacheView = require('./cache/cache-view');
var EditServerDialog = require('../dialogs/edit-server-dialog');
var Directory = require('atom').Directory;
var SelectListView = require('atom-space-pen-views').SelectListView;
module.exports =
    (ServersView = /** @class */ (function (_super) {
        __extends(ServersView, _super);
        function ServersView(actions, mode, fromView) {
            var _this = this;
            _this.actions = actions;
            _this.mode = mode;
            _this.fromView = fromView;
            _this = _super.call(this) || this;
            return _this;
        }
        ServersView.prototype.initialize = function () {
            _super.prototype.initialize.call(this);
            this.serverManager = this.actions.main.getServerManager();
            this.addClass('overlay from-top');
            this.refreshItems();
            if (this.panel == null) {
                this.panel = atom.workspace.addModalPanel({ item: this });
            }
            this.panel.show();
            return this.focusFilterEditor();
        };
        ServersView.prototype.refreshItems = function () {
            var items = [];
            // Only show those that have an open connection.
            var onlyOpen = this.mode === "close";
            var showCount = this.showCount();
            for (var _i = 0, _a = Array.from(this.serverManager.getServers()); _i < _a.length; _i++) {
                var server = _a[_i];
                if (!onlyOpen || server.isOpen()) {
                    var item = {};
                    item.server = server;
                    item.fileCount = 0;
                    item.name = server.getName();
                    item.description = server.getDescription();
                    item.filter = item.name + " " + item.description;
                    if (showCount) {
                        item.fileCount = item.server.getCacheFileCount();
                    }
                    // item.text += " ("+@createCountString(item.fileCount)+")";
                    items.push(item);
                }
            }
            this.setItems(items);
            return items;
        };
        ServersView.prototype.createCountString = function (count) {
            if (count === 1) {
                return "1 file in cache";
            }
            return count + " files in cache";
        };
        ServersView.prototype.getFilterKey = function () {
            return "filter";
        };
        ServersView.prototype.showCount = function () {
            return this.mode !== "open";
        };
        ServersView.prototype.viewForItem = function (item) {
            var primary = "";
            var secondary = "";
            var count = "";
            if (item.name.length > 0) {
                primary = item.name;
                secondary = item.description;
            }
            else {
                primary = item.description;
            }
            if (this.showCount()) {
                count = "(" + this.createCountString(item.fileCount) + ")";
            }
            return "<li class='two-lines'>" +
                "<div class='primary-line'>" +
                "<div style='display: flex'>" +
                "<div style='flex: 1'>" +
                ("<span>" + primary + "</span>") +
                ("<span class='text-subtle' style='margin-left: 0.5em'>" + count + "</span>") +
                "</div>" +
                "<div class='inline-block highlight-info' style='margin-left: 0.5em'" +
                "style='white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>" +
                ("" + item.server.getUsername()) +
                "</div>" +
                "</div>" +
                "</div>" +
                ("<div class='secondary-line'>" + secondary + "</div>") +
                "</li>";
        };
        ServersView.prototype.confirmed = function (item) {
            if (this.mode === "open") {
                return this.confirmOpen(item);
            }
            else if (this.mode === "close") {
                return this.confirmClose(item);
            }
            else if (this.mode === "remove") {
                return this.confirmRemove(item);
            }
            else if (this.mode === "cache") {
                return this.confirmCache(item);
            }
            else if (this.mode === "edit") {
                return this.confirmEdit(item);
            }
        };
        ServersView.prototype.confirmOpen = function (item) {
            this.cancel();
            return this.actions.goDirectory(item.server.getInitialDirectory());
        };
        ServersView.prototype.confirmClose = function (item) {
            var _this = this;
            var confirmed = function () {
                item.server.close();
                var items = _this.refreshItems();
                if (items.length === 0) {
                    return _this.cancel();
                }
            };
            if (item.server.getTaskCount() > 0) {
                var response = atom.confirm({
                    message: "Close",
                    detailedMessage: "Files on this server are still being accessed. Are you sure you want to close the connection?",
                    buttons: ["No", "Yes"]
                });
                if (response === 1) {
                    return confirmed();
                }
            }
            else {
                return confirmed();
            }
        };
        ServersView.prototype.confirmRemove = function (item) {
            var _this = this;
            if (item.server.getOpenFileCount() > 0) {
                atom.notifications.addWarning("A server cannot be removed while its files are being edited.");
                return;
            }
            var question = null;
            var taskCount = item.server.getTaskCount();
            if (item.fileCount > 0) {
                question = "There are still files in the cache. Removing the server will clear the cache.";
            }
            else if (taskCount > 0) {
                question = "Files on this server are still being accessed. Removing the server will also clear the cache.";
            }
            var confirmed = function () {
                _this.serverManager.removeServer(item.server);
                if (_this.serverManager.getServerCount() === 0) {
                    return _this.cancel();
                }
                else {
                    return _this.refreshItems();
                }
            };
            if (question !== null) {
                var response = atom.confirm({
                    message: "Remove",
                    detailedMessage: question + " Are you sure you want to remove the server?",
                    buttons: ["No", "Yes"]
                });
                if (response === 1) {
                    return confirmed();
                }
            }
            else {
                return confirmed();
            }
        };
        ServersView.prototype.confirmCache = function (item) {
            this.cancel();
            var view = new CacheView(item.server);
            var pane = atom.workspace.getActivePane();
            item = pane.addItem(view, { index: 0 });
            return pane.activateItem(item);
        };
        ServersView.prototype.confirmEdit = function (item) {
            this.cancel();
            if (item.server.isOpen()) {
                atom.notifications.addWarning("The server must be closed before it can be edited.");
                return;
            }
            if (item.server.getOpenFileCount() > 0) {
                atom.notifications.addWarning("A server cannot be edited while its files are being accessed.");
                return;
            }
            var dialog = new EditServerDialog(item.server);
            return dialog.attach();
        };
        ServersView.prototype.cancelled = function () {
            this.hide();
            if (this.panel != null) {
                this.panel.destroy();
            }
            if (this.fromView) {
                return this.actions.main.mainView.refocusLastView();
            }
        };
        return ServersView;
    }(SelectListView)));
//# sourceMappingURL=servers-view.js.map