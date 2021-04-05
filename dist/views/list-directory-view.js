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
var ListDirectoryView;
var ListItemView = require('./list-item-view');
module.exports =
    (ListDirectoryView = /** @class */ (function (_super) {
        __extends(ListDirectoryView, _super);
        function ListDirectoryView() {
            return _super.call(this) || this;
        }
        ListDirectoryView.prototype.initialize = function (containerView, index, parentDirectory, directoryController) {
            this.parentDirectory = parentDirectory;
            _super.prototype.initialize.call(this, containerView, index, directoryController);
            // @name.classList.add('directory');
            this.name.className += ' directory';
            this.name.textContent = this.getName();
            this.size.textContent = '';
            if (this.parentDirectory) {
                this.name.classList.add('icon', 'icon-arrow-up');
                return this.date.textContent = '';
            }
            else if (directoryController.isLink()) {
                return this.name.classList.add('icon', 'icon-file-symlink-directory');
            }
            else {
                return this.name.classList.add('icon', 'icon-file-directory');
            }
        };
        ListDirectoryView.prototype.isForParentDirectory = function () {
            return this.parentDirectory;
        };
        ListDirectoryView.prototype.getName = function () {
            if (this.parentDirectory) {
                return "..";
            }
            return this.itemController.getName();
        };
        ListDirectoryView.prototype.getNameColumnValue = function () {
            return this.getName();
        };
        ListDirectoryView.prototype.getExtensionColumnValue = function () {
            return '';
        };
        ListDirectoryView.prototype.getSizeColumnValue = function () {
            return '';
        };
        ListDirectoryView.prototype.getDateColumnValue = function () {
            if (this.parentDirectory) {
                return '';
            }
            return _super.prototype.getDateColumnValue.apply(this, arguments);
        };
        ListDirectoryView.prototype.canRename = function () {
            if (this.parentDirectory) {
                return false;
            }
            return _super.prototype.canRename.call(this);
        };
        ListDirectoryView.prototype.getPath = function () {
            return this.itemController.getPath();
        };
        ListDirectoryView.prototype.isSelectable = function () {
            return !this.parentDirectory;
        };
        ListDirectoryView.prototype.performOpenAction = function () {
            if (this.parentDirectory) {
                return this.getContainerView().openParentDirectory();
            }
            else {
                return _super.prototype.performOpenAction.call(this);
            }
        };
        return ListDirectoryView;
    }(ListItemView)));
module.exports = document.registerElement('list-directory-view', { prototype: ListDirectoryView.prototype, "extends": 'tr' });
//# sourceMappingURL=list-directory-view.js.map