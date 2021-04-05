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
var ListFileView;
var ListItemView = require('./list-item-view');
module.exports =
    (ListFileView = /** @class */ (function (_super) {
        __extends(ListFileView, _super);
        function ListFileView() {
            return _super.call(this) || this;
        }
        ListFileView.prototype.initialize = function (containerView, index, fileController) {
            _super.prototype.initialize.call(this, containerView, index, fileController);
            this.classList.add('file');
            if (fileController.isLink()) {
                this.name.classList.add('icon', 'icon-file-symlink-file');
            }
            else {
                this.name.classList.add('icon', 'icon-file-text');
            }
            this.name.textContent = this.getNameColumnValue();
            return this.extension.textContent = fileController.getExtensionPart();
        };
        ListFileView.prototype.getName = function () {
            return this.itemController.getName();
        };
        ListFileView.prototype.getPath = function () {
            return this.itemController.getPath();
        };
        ListFileView.prototype.isSelectable = function () {
            return true;
        };
        ListFileView.prototype.getNameColumnValue = function () {
            if (this.containerView.isExtensionColumnVisible()) {
                return this.itemController.getNamePart();
            }
            return this.itemController.getName();
        };
        ListFileView.prototype.getExtensionColumnValue = function () {
            if (this.containerView.isExtensionColumnVisible()) {
                return this.itemController.getExtensionPart();
            }
            return '';
        };
        return ListFileView;
    }(ListItemView)));
module.exports = document.registerElement('list-file-view', { prototype: ListFileView.prototype, "extends": 'tr' });
//# sourceMappingURL=list-file-view.js.map