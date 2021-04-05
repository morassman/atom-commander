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
var TabView;
var View = require('atom-space-pen-views').View;
module.exports =
    (TabView = /** @class */ (function (_super) {
        __extends(TabView, _super);
        function TabView(tabsView, view) {
            var _this = this;
            _this.tabsView = tabsView;
            _this.view = view;
            _this = _super.call(this) || this;
            _this.view.setTabView(_this);
            return _this;
        }
        TabView.content = function () {
            return this.div({ "class": "atom-commander-tab-view inline-block-tight", click: "select" });
        };
        TabView.prototype.getView = function () {
            return this.view;
        };
        TabView.prototype.destroy = function () {
            this.view.dispose();
            return this.element.remove();
        };
        TabView.prototype.getElement = function () {
            return this.element;
        };
        // Called by the view when the directory has changed.
        TabView.prototype.directoryChanged = function () {
            var directory = this.view.directory;
            if (directory === null) {
                return;
            }
            var name = directory.getBaseName();
            if (name.length === 0) {
                var fileSystem = directory.getFileSystem();
                if (fileSystem.isLocal()) {
                    name = directory.getURI();
                }
                else {
                    name = fileSystem.getName();
                }
            }
            return this.text(name);
        };
        TabView.prototype.removeButtonPressed = function () { };
        TabView.prototype.select = function (requestFocus) {
            if (requestFocus == null) {
                requestFocus = true;
            }
            if (this.isSelected()) {
                return;
            }
            return this.tabsView.selectTab(this, requestFocus);
        };
        TabView.prototype.setSelected = function (selected) {
            this.removeClass("atom-commander-tab-view-selected");
            this.removeClass("text-highlight");
            this.removeClass("text-subtle");
            if (selected) {
                this.addClass("atom-commander-tab-view-selected");
                this.addClass("text-highlight");
                return this.element.scrollIntoView();
            }
            else {
                return this.addClass("text-subtle");
            }
        };
        TabView.prototype.scrollIntoView = function () {
            return this.element.scrollIntoView();
        };
        TabView.prototype.isSelected = function () {
            return this.hasClass("atom-commander-tab-view-selected");
        };
        TabView.prototype.serialize = function () {
            return this.view.serialize();
        };
        TabView.prototype.deserialize = function (state) {
            return this.view.deserialize(null, state);
        };
        return TabView;
    }(View)));
//# sourceMappingURL=tab-view.js.map