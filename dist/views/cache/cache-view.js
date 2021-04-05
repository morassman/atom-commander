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
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var CacheView;
var CacheItemView = require('./cache-item-view');
var _a = require('atom-space-pen-views'), $ = _a.$, View = _a.View;
var CompositeDisposable = require('atom').CompositeDisposable;
module.exports =
    (CacheView = /** @class */ (function (_super) {
        __extends(CacheView, _super);
        function CacheView(server) {
            var _this = this;
            _this.server = server;
            _this = _super.call(this, _this.server) || this;
            return _this;
        }
        CacheView.content = function () {
            var _this = this;
            return this.div({ "class": "atom-commander-sync" }, function () {
                _this.div({ "class": "title-panel" }, function () {
                    _this.span({ "class": "title", outlet: "titlePanel" });
                    return _this.button("Refresh", { "class": "button btn btn-sm", outlet: "refreshButton", click: "refresh" });
                });
                _this.div({ "class": "table-panel" }, function () {
                    return _this.table(function () {
                        return _this.tbody({ outlet: "tableBody", tabindex: -1 });
                    });
                });
                return _this.div({ "class": "empty-panel", outlet: "emptyPanel" }, function () {
                    return _this.ul({ "class": "background-message centered" }, function () {
                        return _this.li("The cache is empty");
                    });
                });
            });
        };
        CacheView.prototype.getTitle = function () {
            return "Cache: " + this.server.getDisplayName();
        };
        CacheView.prototype.getLocalFileSystem = function () {
            return this.server.getMain().getLocalFileSystem();
        };
        CacheView.prototype.getTaskManager = function () {
            return this.fileSystem.getTaskManager();
        };
        CacheView.prototype.initialize = function () {
            var _this = this;
            var name = this.server.getName();
            var title = this.server.getDescription();
            if (name.length > 0) {
                title = name + " : " + title;
            }
            this.syncItems = [];
            this.disposables = new CompositeDisposable();
            this.titlePanel.text("Local cache for " + title);
            this.refreshButton.on('mousedown', function (e) { return e.preventDefault(); });
            this.header = new CacheItemView();
            this.header.initializeHeader(this);
            this.jHeader = $(this.header);
            this.jHeader.addClass("table-header");
            this.tableBody[0].appendChild(this.header);
            this.fileSystem = this.server.getFileSystem().clone();
            this.disposables.add(this.fileSystem.getTaskManager().onEnd(function (err) { return _this.taskManagerEnd(err); }));
            return this.refresh();
        };
        CacheView.prototype.taskManagerEnd = function (err) {
            var _this = this;
            if ((err == null)) {
                return;
            }
            var message = "Error.";
            if (err.message) {
                message += " " + err.message;
            }
            return (function () {
                var result = [];
                for (var _i = 0, _a = Array.from(_this.syncItems); _i < _a.length; _i++) {
                    var syncItem = _a[_i];
                    syncItem.showStatus(message, 2);
                    result.push(syncItem.setTransferInProgress(false));
                }
                return result;
            })();
        };
        CacheView.prototype.refresh = function () {
            for (var _i = 0, _a = Array.from(this.syncItems); _i < _a.length; _i++) {
                var syncItem = _a[_i];
                syncItem.remove();
            }
            this.header.setChecked(false);
            this.syncItems = [];
            var cachePath = this.server.getCachePath();
            var filePaths = this.server.getCachedFilePaths();
            for (var _b = 0, _c = Array.from(filePaths); _b < _c.length; _b++) {
                var filePath = _c[_b];
                var item = new CacheItemView();
                var remotePath = filePath.substring(cachePath.length);
                remotePath = remotePath.split("\\").join("/");
                item.initializeRow(this, filePath, remotePath);
                this.syncItems.push(item);
                this.tableBody[0].appendChild(item);
            }
            return this.refreshEmptyPanel();
        };
        CacheView.prototype.setAllChecked = function (checked) {
            return Array.from(this.syncItems).map(function (syncItem) {
                return syncItem.setChecked(checked);
            });
        };
        CacheView.prototype.countChecked = function () {
            var result = 0;
            for (var _i = 0, _a = Array.from(this.syncItems); _i < _a.length; _i++) {
                var syncItem = _a[_i];
                if (syncItem.isChecked()) {
                    result++;
                }
            }
            return result;
        };
        CacheView.prototype.uploadChecked = function () {
            var _this = this;
            return (function () {
                var result = [];
                for (var _i = 0, _a = Array.from(_this.syncItems); _i < _a.length; _i++) {
                    var syncItem = _a[_i];
                    if (syncItem.isChecked()) {
                        result.push(syncItem.upload());
                    }
                    else {
                        result.push(undefined);
                    }
                }
                return result;
            })();
        };
        CacheView.prototype.downloadChecked = function () {
            var _this = this;
            return (function () {
                var result = [];
                for (var _i = 0, _a = Array.from(_this.syncItems); _i < _a.length; _i++) {
                    var syncItem = _a[_i];
                    if (syncItem.isChecked()) {
                        result.push(syncItem.download());
                    }
                    else {
                        result.push(undefined);
                    }
                }
                return result;
            })();
        };
        CacheView.prototype.deleteChecked = function () {
            var _this = this;
            if (this.countChecked() === 0) {
                return;
            }
            var response = atom.confirm({
                message: 'Remove',
                detailedMessage: 'Remove the selected files from the cache?',
                buttons: ["No", "Yes"]
            });
            if (response === 0) {
                return;
            }
            return (function () {
                var result = [];
                for (var _i = 0, _a = Array.from(_this.syncItems.slice()); _i < _a.length; _i++) {
                    var syncItem = _a[_i];
                    if (syncItem.isChecked()) {
                        result.push(syncItem["delete"]());
                    }
                    else {
                        result.push(undefined);
                    }
                }
                return result;
            })();
        };
        CacheView.prototype.removeItem = function (item) {
            item.remove();
            var index = this.syncItems.indexOf(item);
            if (index >= 0) {
                this.syncItems.splice(index, 1);
            }
            return this.refreshEmptyPanel();
        };
        CacheView.prototype.refreshEmptyPanel = function () {
            if (this.syncItems.length === 0) {
                this.emptyPanel.show();
                return this.jHeader.hide();
            }
            else {
                this.emptyPanel.hide();
                return this.jHeader.show();
            }
        };
        CacheView.prototype.destroy = function () {
            if (this.fileSystem != null) {
                this.fileSystem.disconnect();
            }
            return (this.disposables != null ? this.disposables.dispose() : undefined);
        };
        return CacheView;
    }(View)));
//# sourceMappingURL=cache-view.js.map