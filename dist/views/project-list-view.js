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
var ProjectListView;
var drivelist = require('drivelist');
var Directory = require('atom').Directory;
var SelectListView = require('atom-space-pen-views').SelectListView;
module.exports =
    (ProjectListView = /** @class */ (function (_super) {
        __extends(ProjectListView, _super);
        function ProjectListView(actions, fromView) {
            var _this = this;
            _this.actions = actions;
            _this.fromView = fromView;
            _this = _super.call(this) || this;
            return _this;
        }
        ProjectListView.prototype.initialize = function () {
            _super.prototype.initialize.call(this);
            this.refreshItems();
            this.addClass('overlay from-top');
            if (this.panel == null) {
                this.panel = atom.workspace.addModalPanel({ item: this });
            }
            this.panel.show();
            return this.focusFilterEditor();
        };
        ProjectListView.prototype.refreshItems = function () {
            var items = [];
            var projects = atom.project.getDirectories();
            for (var _i = 0, _a = Array.from(projects); _i < _a.length; _i++) {
                var project = _a[_i];
                items.push(this.createItem(project));
            }
            return this.setItems(items);
        };
        ProjectListView.prototype.createItem = function (project) {
            var item = {};
            item.project = project;
            item.primary = project.getBaseName();
            item.secondary = project.getPath();
            return item;
        };
        ProjectListView.prototype.getFilterKey = function () {
            return "secondary";
        };
        ProjectListView.prototype.viewForItem = function (item) {
            return "<li class='two-lines'>\n<div class='primary-line'>" + item.primary + "</div>\n<div class='secondary-line'>" + item.secondary + "</div>\n</li>";
        };
        ProjectListView.prototype.confirmed = function (item) {
            this.actions.goDirectory(item.project);
            return this.cancel();
        };
        ProjectListView.prototype.cancelled = function () {
            this.hide();
            if (this.panel != null) {
                this.panel.destroy();
            }
            if (this.fromView) {
                return this.actions.main.mainView.refocusLastView();
            }
        };
        return ProjectListView;
    }(SelectListView)));
//# sourceMappingURL=project-list-view.js.map