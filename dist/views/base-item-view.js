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
var BaseItemView;
module.exports =
    (BaseItemView = /** @class */ (function (_super) {
        __extends(BaseItemView, _super);
        function BaseItemView() {
            var _this = _super.call(this) || this;
            _this.selected = false;
            _this.highlighted = false;
            _this.focused = false;
            _this.itemName = '';
            return _this;
        }
        BaseItemView.prototype.initialize = function (containerView, itemController) {
            this.containerView = containerView;
            this.itemController = itemController;
            this.itemController.initialize(this);
            this.classList.add('item');
            return this.itemName = this.getName();
        };
        BaseItemView.prototype.getContainerView = function () {
            return this.containerView;
        };
        BaseItemView.prototype.getItemController = function () {
            return this.itemController;
        };
        BaseItemView.prototype.getItem = function () {
            return this.itemController.getItem();
        };
        // Called if anything about the item changed.
        BaseItemView.prototype.refresh = function () { };
        // Override to return the name of this item.
        BaseItemView.prototype.getName = function () { };
        // Override to return the path of this item.
        BaseItemView.prototype.getPath = function () { };
        // Override to return whether this item is selectable.
        BaseItemView.prototype.isSelectable = function () { };
        BaseItemView.prototype.setSizeColumnVisible = function (visible) { };
        BaseItemView.prototype.canRename = function () {
            return this.itemController.canRename();
        };
        BaseItemView.prototype.highlight = function (highlighted, focused) {
            this.highlighted = highlighted;
            this.focused = focused;
            return this.refreshClassList();
        };
        BaseItemView.prototype.toggleSelect = function () {
            return this.select(!this.selected);
        };
        BaseItemView.prototype.select = function (selected) {
            if (this.isSelectable()) {
                this.selected = selected;
                return this.refreshClassList();
            }
        };
        BaseItemView.prototype.refreshClassList = function () {
            this.classList.remove('selected');
            this.classList.remove('highlighted-focused');
            this.classList.remove('highlighted-unfocused');
            if (this.highlighted) {
                if (this.focused) {
                    this.classList.add('highlighted-focused');
                }
                else {
                    this.classList.add('highlighted-unfocused');
                }
            }
            if (this.selected) {
                return this.classList.add('selected');
            }
        };
        BaseItemView.prototype.performOpenAction = function () {
            return this.itemController.performOpenAction();
        };
        return BaseItemView;
    }(HTMLElement)));
//# sourceMappingURL=base-item-view.js.map