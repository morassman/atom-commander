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
var DriveListView;
var drivelist = require('drivelist');
var Directory = require('atom').Directory;
var SelectListView = require('atom-space-pen-views').SelectListView;
module.exports =
    (DriveListView = /** @class */ (function (_super) {
        __extends(DriveListView, _super);
        function DriveListView(actions, fromView) {
            var _this = this;
            _this.actions = actions;
            _this.fromView = fromView;
            _this = _super.call(this) || this;
            return _this;
        }
        DriveListView.prototype.initialize = function () {
            var _this = this;
            _super.prototype.initialize.call(this);
            if (process.platform === "darwin") {
                this.refreshDarwinItems();
            }
            else {
                drivelist.list(function (error, disks) {
                    if (!error) {
                        return _this.refreshItems(disks);
                    }
                });
            }
            this.addClass('overlay from-top');
            if (this.panel == null) {
                this.panel = atom.workspace.addModalPanel({ item: this });
            }
            this.panel.show();
            return this.focusFilterEditor();
        };
        DriveListView.prototype.refreshDarwinItems = function () {
            var items = [];
            var directory = new Directory("/Volumes");
            for (var _i = 0, _a = Array.from(directory.getEntriesSync()); _i < _a.length; _i++) {
                var entry = _a[_i];
                if (entry.isDirectory()) {
                    items.push(this.createDarwinItem(entry.getBaseName()));
                }
            }
            return this.setItems(items);
        };
        DriveListView.prototype.refreshItems = function (disks) {
            var items = [];
            var createItem = this.createLinuxItem;
            if (process.platform === "win32") {
                createItem = this.createWindowsItem;
            }
            for (var _i = 0, _a = Array.from(disks); _i < _a.length; _i++) {
                var disk = _a[_i];
                var item = createItem(disk);
                if (item !== null) {
                    items.push(item);
                }
            }
            return this.setItems(items);
        };
        DriveListView.prototype.createDarwinItem = function (volume) {
            var item = {};
            item.path = "/Volumes/" + volume;
            item.primary = volume;
            item.secondary = item.path;
            item.text = volume;
            return item;
        };
        DriveListView.prototype.createLinuxItem = function (disk) {
            if ((disk.mountpoint == null)) {
                return null;
            }
            var item = {};
            item.path = disk.mountpoint;
            item.primary = disk.mountpoint;
            item.secondary = disk.description;
            item.text = item.primary + " " + item.secondary;
            return item;
        };
        DriveListView.prototype.createWindowsItem = function (disk) {
            var item = {};
            item.path = disk.mountpoint + "\\";
            item.primary = disk.mountpoint;
            item.secondary = disk.description;
            item.text = item.primary + " " + item.secondary;
            return item;
        };
        DriveListView.prototype.getFilterKey = function () {
            return "text";
        };
        DriveListView.prototype.viewForItem = function (item) {
            return "<li class='two-lines'>\n<div class='primary-line'>" + item.primary + "</div>\n<div class='secondary-line'>" + item.secondary + "</div>\n</li>";
        };
        DriveListView.prototype.confirmed = function (item) {
            this.actions.goDirectory(new Directory(item.path));
            return this.cancel();
        };
        DriveListView.prototype.cancelled = function () {
            this.hide();
            if (this.panel != null) {
                this.panel.destroy();
            }
            if (this.fromView) {
                return this.actions.main.mainView.refocusLastView();
            }
        };
        return DriveListView;
    }(SelectListView)));
//# sourceMappingURL=drive-list-view.js.map