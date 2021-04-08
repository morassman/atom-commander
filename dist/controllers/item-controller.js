"use strict";
exports.__esModule = true;
exports.ItemController = void 0;
var filesize = require('filesize');
var ItemController = /** @class */ (function () {
    function ItemController(item) {
        this.item = item;
        this.item.setController(this);
    }
    ItemController.prototype.initialize = function (itemView) {
        this.itemView = itemView;
    };
    // Called if anything about the item changed.
    ItemController.prototype.refresh = function () {
        return (this.itemView != null ? this.itemView.refresh() : undefined);
    };
    ItemController.prototype.getItem = function () {
        return this.item;
    };
    ItemController.prototype.getItemView = function () {
        return this.itemView;
    };
    ItemController.prototype.getContainerView = function () {
        return this.itemView.getContainerView();
    };
    ItemController.prototype.getName = function () {
        return this.item.getBaseName();
    };
    ItemController.prototype.getNamePart = function () {
        return this.getName();
    };
    ItemController.prototype.getExtensionPart = function () {
        return "";
    };
    ItemController.prototype.getPath = function () {
        return this.item.getRealPathSync();
    };
    // Override to indicate if this item can be renamed.
    ItemController.prototype.canRename = function () {
        return this.item.isWritable();
    };
    ItemController.prototype.isLink = function () {
        return this.item.isLink();
    };
    ItemController.prototype.getNameExtension = function () {
        var baseName = this.item.getBaseName();
        if ((baseName == null)) {
            return ["", ""];
        }
        var index = baseName.lastIndexOf(".");
        var lastIndex = baseName.length - 1;
        if ((index === -1) || (index === 0) || (index === lastIndex)) {
            return [baseName, ''];
        }
        return [baseName.slice(0, index), baseName.slice(index + 1)];
    };
    ItemController.prototype.getFormattedModifyDate = function () {
        var date = this.item.getModifyDate();
        if (date != null) {
            return date.toLocaleDateString();
        }
        return "";
    };
    ItemController.prototype.getFormattedSize = function () {
        var size = this.item.getSize();
        if (size != null) {
            return filesize(size);
        }
        return "";
    };
    // Override this to implement the open behavior of this item.
    ItemController.prototype.performOpenAction = function () { };
    return ItemController;
}());
exports.ItemController = ItemController;
//# sourceMappingURL=item-controller.js.map