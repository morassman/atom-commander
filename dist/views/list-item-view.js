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
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var ListItemView;
var BaseItemView = require('./base-item-view');
var $ = require('atom-space-pen-views').$;
module.exports =
    (ListItemView = /** @class */ (function (_super) {
        __extends(ListItemView, _super);
        function ListItemView() {
            return _super.call(this) || this;
        }
        ListItemView.prototype.initialize = function (containerView, index, fileController) {
            this.index = index;
            _super.prototype.initialize.call(this, containerView, fileController);
            this.name = document.createElement('td');
            this.extension = document.createElement('td');
            this.size = document.createElement('td');
            this.date = document.createElement('td');
            this.extension.classList.add('align-right');
            this.size.classList.add('align-right');
            this.date.classList.add('align-right');
            this.size.textContent = fileController.getFormattedSize();
            this.date.textContent = fileController.getFormattedModifyDate();
            this.appendChild(this.name);
            this.appendChild(this.extension);
            this.appendChild(this.size);
            return this.appendChild(this.date);
        };
        ListItemView.prototype.refresh = function () {
            this.name.textContent = this.getNameColumnValue();
            this.extension.textContent = this.getExtensionColumnValue();
            this.size.textContent = this.getSizeColumnValue();
            return this.date.textContent = this.getDateColumnValue();
        };
        ListItemView.prototype.getNameColumnValue = function () {
            return this.itemController.getNamePart();
        };
        ListItemView.prototype.getExtensionColumnValue = function () {
            return this.itemController.getExtensionPart();
        };
        ListItemView.prototype.getSizeColumnValue = function () {
            return this.itemController.getFormattedSize();
        };
        ListItemView.prototype.getDateColumnValue = function () {
            return this.itemController.getFormattedModifyDate();
        };
        ListItemView.prototype.setSizeColumnVisible = function (visible) {
            if (visible) {
                return $(this.size).show();
            }
            else {
                return $(this.size).hide();
            }
        };
        ListItemView.prototype.setDateColumnVisible = function (visible) {
            if (visible) {
                return $(this.date).show();
            }
            else {
                return $(this.date).hide();
            }
        };
        ListItemView.prototype.setExtensionColumnVisible = function (visible) {
            if (visible) {
                $(this.extension).show();
            }
            else {
                $(this.extension).hide();
            }
            return this.refresh();
        };
        return ListItemView;
    }(BaseItemView)));
//# sourceMappingURL=list-item-view.js.map