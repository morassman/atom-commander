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
var TabbedView;
var View = require('atom-space-pen-views').View;
var TabsView = require('./tabs-view');
var ListView = require('./list-view');
module.exports =
    (TabbedView = /** @class */ (function (_super) {
        __extends(TabbedView, _super);
        function TabbedView(left) {
            var _this = this;
            _this.left = left;
            _this = _super.call(this) || this;
            _this.tabsView.hide();
            _this.tabsView.setTabbedView(_this);
            _this.selectedView = null;
            return _this;
        }
        TabbedView.content = function (left) {
            var _this = this;
            return this.div({}, function () {
                _this.subview("tabsView", new TabsView());
                return _this.div({ style: "display: flex; flex:1; overflow: auto", outlet: "container" });
            });
        };
        TabbedView.prototype.setMainView = function (mainView) {
            this.mainView = mainView;
        };
        TabbedView.prototype.getSelectedView = function () {
            return this.selectedView;
        };
        TabbedView.prototype.getTabCount = function () {
            return this.tabsView.getTabCount();
        };
        TabbedView.prototype.setTabsVisible = function (visible) {
            if (visible) {
                return this.tabsView.show();
            }
            else {
                return this.tabsView.hide();
            }
        };
        TabbedView.prototype.insertTab = function () {
            if ((this.selectedView == null)) {
                return;
            }
            var itemView = this.selectedView.getHighlightedItem();
            if (itemView === null) {
                return;
            }
            var item = itemView.getItem();
            if (!item.isDirectory() || !itemView.isSelectable()) {
                item = this.selectedView.directory;
            }
            var index = this.tabsView.getSelectedIndex();
            if (index !== null) {
                index++;
            }
            return this.addTab(item, true, true, index);
        };
        TabbedView.prototype.addTab = function (directory, select, requestFocus, index) {
            if (directory === void 0) { directory = null; }
            if (index === void 0) { index = null; }
            if (select == null) {
                select = false;
            }
            if (requestFocus == null) {
                requestFocus = false;
            }
            var listView = new ListView(this.left);
            listView.setMainView(this.mainView);
            if (directory !== null) {
                listView.openDirectory(directory);
            }
            if (this.selectedView !== null) {
                listView.setContentHeight(this.selectedView.getContentHeight());
            }
            var tabView = this.tabsView.addTab(listView, select, requestFocus, index);
            this.mainView.tabCountChanged();
            return tabView;
        };
        TabbedView.prototype.removeSelectedTab = function () {
            this.tabsView.removeSelectedTab();
            return this.mainView.tabCountChanged();
        };
        TabbedView.prototype.previousTab = function () {
            return this.tabsView.previousTab();
        };
        TabbedView.prototype.nextTab = function () {
            return this.tabsView.nextTab();
        };
        TabbedView.prototype.shiftLeft = function () {
            return this.tabsView.shiftLeft();
        };
        TabbedView.prototype.shiftRight = function () {
            return this.tabsView.shiftRight();
        };
        TabbedView.prototype.selectView = function (view, requestFocus) {
            if (requestFocus == null) {
                requestFocus = false;
            }
            if (this.selectedView !== null) {
                this.selectedView.storeScrollTop();
                this.selectedView.detach();
            }
            this.container.append(view);
            this.selectedView = view;
            this.selectedView.restoreScrollTop();
            if (requestFocus) {
                return this.selectedView.requestFocus();
            }
        };
        TabbedView.prototype.adjustContentHeight = function (change) {
            if (this.selectedView === null) {
                return;
            }
            this.selectedView.adjustContentHeight(change);
            return this.tabsView.setContentHeight(this.selectedView.getContentHeight());
        };
        TabbedView.prototype.setContentHeight = function (contentHeight) {
            return this.tabsView.setContentHeight(contentHeight);
        };
        TabbedView.prototype.fileSystemRemoved = function (fileSystem) {
            return this.tabsView.fileSystemRemoved(fileSystem);
        };
        TabbedView.prototype.serverClosed = function (server) {
            return this.tabsView.serverClosed(server);
        };
        TabbedView.prototype.setSizeColumnVisible = function (visible) {
            return Array.from(this.tabsView.getTabViews()).map(function (tabView) {
                return tabView.getView().setSizeColumnVisible(visible);
            });
        };
        TabbedView.prototype.setDateColumnVisible = function (visible) {
            return Array.from(this.tabsView.getTabViews()).map(function (tabView) {
                return tabView.getView().setDateColumnVisible(visible);
            });
        };
        TabbedView.prototype.setExtensionColumnVisible = function (visible) {
            return Array.from(this.tabsView.getTabViews()).map(function (tabView) {
                return tabView.getView().setExtensionColumnVisible(visible);
            });
        };
        TabbedView.prototype.serialize = function () {
            var state = {};
            state.tabs = [];
            for (var _i = 0, _a = Array.from(this.tabsView.getTabViews()); _i < _a.length; _i++) {
                var tabView = _a[_i];
                state.tabs.push(tabView.serialize());
            }
            state.selectedTab = this.tabsView.getSelectedIndex();
            return state;
        };
        TabbedView.prototype.deserialize = function (version, path, state) {
            try {
                if (version === 1) {
                    this.deserialize1(path, state);
                }
                else if (version >= 2) {
                    this.deserialize2(state);
                }
            }
            catch (error) {
                console.error(error);
            }
            if (this.getTabCount() === 0) {
                var fileSystem = this.mainView.getMain().getLocalFileSystem();
                if (path != null) {
                    this.addTab(fileSystem.getDirectory(path));
                }
                else {
                    this.addTab(fileSystem.getInitialDirectory());
                }
            }
            if (this.tabsView.getSelectedIndex() === null) {
                return this.tabsView.selectIndex(0);
            }
        };
        TabbedView.prototype.deserialize1 = function (path, state) {
            var tabView = this.addTab();
            return tabView.getView().deserialize(path, state);
        };
        TabbedView.prototype.deserialize2 = function (state) {
            var _this = this;
            var fileSystem = this.mainView.getMain().getLocalFileSystem();
            var index = 0;
            return (function () {
                var result = [];
                for (var _i = 0, _a = Array.from(state.tabs); _i < _a.length; _i++) {
                    var tab = _a[_i];
                    var tabView = _this.addTab();
                    tabView.deserialize(tab);
                    if (index === state.selectedTab) {
                        tabView.select(false);
                    }
                    result.push(index++);
                }
                return result;
            })();
        };
        return TabbedView;
    }(View)));
//# sourceMappingURL=tabbed-view.js.map