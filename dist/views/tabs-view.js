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
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var TabsView;
var View = require('atom-space-pen-views').View;
var TabView = require('./tab-view');
module.exports =
    (TabsView = /** @class */ (function (_super) {
        __extends(TabsView, _super);
        function TabsView() {
            var _this = _super.call(this) || this;
            _this.tabs = [];
            return _this;
        }
        TabsView.content = function () {
            var _this = this;
            return this.div({ "class": "atom-commander-tabs-view inline-block-tight" }, function () {
                return _this.div({ "class": "btn-group btn-group-xs", outlet: "buttonView" });
            });
        };
        TabsView.prototype.setTabbedView = function (tabbedView) {
            this.tabbedView = tabbedView;
        };
        TabsView.prototype.getTabViews = function () {
            return this.tabs;
        };
        TabsView.prototype.getTabCount = function () {
            return this.tabs.length;
        };
        TabsView.prototype.addTab = function (view, select, requestFocus, index) {
            if (index === void 0) { index = null; }
            if (select == null) {
                select = false;
            }
            if (requestFocus == null) {
                requestFocus = false;
            }
            if (index === null) {
                index = this.tabs.length;
            }
            var tabView = new TabView(this, view);
            if (index === this.tabs.length) {
                this.tabs.push(tabView);
                this.buttonView.append(tabView);
            }
            else {
                var afterTab = this.tabs[index - 1];
                this.tabs.splice(index, 0, tabView);
                afterTab.after(tabView);
            }
            if (select) {
                this.selectTab(tabView, requestFocus);
            }
            return tabView;
        };
        TabsView.prototype.removeSelectedTab = function () {
            if (this.getTabCount() === 1) {
                return;
            }
            var index = this.getSelectedIndex();
            if (index === null) {
                return;
            }
            var tab = this.tabs[index];
            this.tabs.splice(index, 1);
            if (index >= this.tabs.length) {
                index--;
            }
            this.selectIndex(index, true);
            return tab.destroy();
        };
        TabsView.prototype.previousTab = function () {
            return this.adjustTab(-1);
        };
        TabsView.prototype.nextTab = function () {
            return this.adjustTab(1);
        };
        TabsView.prototype.adjustTab = function (change) {
            var index = this.getSelectedIndex();
            if (index === null) {
                return;
            }
            index += change;
            if (index < 0) {
                index = this.tabs.length - 1;
            }
            else if (index >= this.tabs.length) {
                index = 0;
            }
            return this.selectTab(this.tabs[index]);
        };
        TabsView.prototype.shiftLeft = function () {
            return this.shiftTab(-1);
        };
        TabsView.prototype.shiftRight = function () {
            return this.shiftTab(1);
        };
        TabsView.prototype.shiftTab = function (change) {
            if (this.tabs.length <= 1) {
                return;
            }
            var index = this.getSelectedIndex();
            if (index === null) {
                return;
            }
            var tab = this.tabs[index];
            this.tabs.splice(index, 1);
            var newIndex = index + change;
            tab.detach();
            if (newIndex < 0) {
                this.tabs.push(tab);
                this.buttonView.append(tab);
            }
            else if (newIndex > this.tabs.length) {
                this.tabs.unshift(tab);
                this.buttonView.prepend(tab);
            }
            else {
                this.tabs.splice(newIndex, 0, tab);
                if (newIndex === 0) {
                    this.tabs[newIndex + 1].before(tab);
                }
                else {
                    this.tabs[newIndex - 1].after(tab);
                }
            }
            return tab.scrollIntoView();
        };
        TabsView.prototype.getSelectedIndex = function () {
            var index = 0;
            for (var _i = 0, _a = Array.from(this.tabs); _i < _a.length; _i++) {
                var tab = _a[_i];
                if (tab.isSelected()) {
                    return index;
                }
                index++;
            }
            return null;
        };
        TabsView.prototype.selectIndex = function (index, requestFocus) {
            if (requestFocus == null) {
                requestFocus = false;
            }
            return this.selectTab(this.tabs[index], requestFocus);
        };
        TabsView.prototype.selectTab = function (tab, requestFocus) {
            if (requestFocus == null) {
                requestFocus = true;
            }
            for (var _i = 0, _a = Array.from(this.tabs); _i < _a.length; _i++) {
                var temp = _a[_i];
                temp.setSelected(false);
            }
            tab.setSelected(true);
            return this.tabbedView.selectView(tab.getView(), requestFocus);
        };
        TabsView.prototype.adjustContentHeight = function (change) {
            return Array.from(this.tabs).map(function (tabView) {
                return tabView.getView().adjustContentHeight(change);
            });
        };
        TabsView.prototype.setContentHeight = function (contentHeight) {
            return Array.from(this.tabs).map(function (tabView) {
                return tabView.getView().setContentHeight(contentHeight);
            });
        };
        TabsView.prototype.fileSystemRemoved = function (fileSystem) {
            return Array.from(this.tabs).map(function (tabView) {
                return tabView.getView().fileSystemRemoved(fileSystem);
            });
        };
        TabsView.prototype.serverClosed = function (server) {
            return Array.from(this.tabs).map(function (tabView) {
                return tabView.getView().serverClosed(server);
            });
        };
        return TabsView;
    }(View)));
//# sourceMappingURL=tabs-view.js.map