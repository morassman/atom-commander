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
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var ListSymLinkView;
var ListItemView = require('./list-item-view');
module.exports =
    (ListSymLinkView = /** @class */ (function (_super) {
        __extends(ListSymLinkView, _super);
        function ListSymLinkView() {
            return _super.call(this) || this;
        }
        ListSymLinkView.prototype.initialize = function (containerView, index, symLinkController) {
            _super.prototype.initialize.call(this, containerView, index, symLinkController);
            return this.refresh();
        };
        ListSymLinkView.prototype.refresh = function () {
            var targetItem;
            _super.prototype.refresh.call(this);
            var targetController = this.itemController.getTargetController();
            if (targetController != null) {
                targetItem = targetController.getItem();
            }
            this.classList.remove('file', 'directory');
            this.name.classList.remove('icon-link');
            if (targetItem != null ? targetItem.isFile() : undefined) {
                this.classList.add('file');
                return this.name.classList.add('icon-file-symlink-file');
            }
            else if (targetItem != null ? targetItem.isDirectory() : undefined) {
                this.classList.add('directory');
                return this.name.classList.add('icon', 'icon-file-symlink-directory');
            }
            else {
                return this.name.classList.add('icon', 'icon-link');
            }
        };
        ListSymLinkView.prototype.getName = function () {
            return this.itemController.getName();
        };
        ListSymLinkView.prototype.getPath = function () {
            return this.itemController.getPath();
        };
        ListSymLinkView.prototype.getNameColumnValue = function () {
            var targetItem;
            var targetController = this.itemController.getTargetController();
            if (targetController != null) {
                targetItem = targetController.getItem();
            }
            if ((targetItem == null)) {
                return this.itemController.getName();
            }
            if (targetItem.isDirectory()) {
                return this.itemController.getName();
            }
            if (this.containerView.isExtensionColumnVisible()) {
                return this.itemController.getNamePart();
            }
            return this.itemController.getName();
        };
        ListSymLinkView.prototype.getExtensionColumnValue = function () {
            if (this.containerView.isExtensionColumnVisible()) {
                return this.itemController.getExtensionPart();
            }
            return '';
        };
        ListSymLinkView.prototype.getSizeColumnValue = function () {
            var targetItem;
            var targetController = this.itemController.getTargetController();
            if (targetController != null) {
                targetItem = targetController.getItem();
            }
            if ((targetItem == null)) {
                return '';
            }
            if (targetItem.isDirectory()) {
                return '';
            }
            return _super.prototype.getSizeColumnValue.apply(this, arguments);
        };
        ListSymLinkView.prototype.isSelectable = function () {
            return true;
        };
        return ListSymLinkView;
    }(ListItemView)));
module.exports = document.registerElement('list-symlink-view', { prototype: ListSymLinkView.prototype, "extends": 'tr' });
//# sourceMappingURL=list-symlink-view.js.map