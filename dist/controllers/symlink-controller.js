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
var SymLinkController;
var ItemController = require('./item-controller');
var FileController = require('./file-controller');
var DirectoryController = require('./directory-controller');
module.exports =
    (SymLinkController = /** @class */ (function (_super) {
        __extends(SymLinkController, _super);
        function SymLinkController(symLink) {
            var _this = _super.call(this, symLink) || this;
            _this.targetController = null;
            return _this;
        }
        SymLinkController.prototype.getNamePart = function () {
            if (this.namePart != null) {
                return this.namePart;
            }
            return _super.prototype.getNamePart.call(this);
        };
        SymLinkController.prototype.getExtensionPart = function () {
            if (this.extensionPart != null) {
                return this.extensionPart;
            }
            return _super.prototype.getExtensionPart.call(this);
        };
        SymLinkController.prototype.getTargetController = function () {
            return this.targetController;
        };
        SymLinkController.prototype.getTargetItem = function () {
            return this.item.getTargetItem();
        };
        SymLinkController.prototype.refresh = function () {
            this.refreshTargetController();
            return _super.prototype.refresh.call(this);
        };
        SymLinkController.prototype.refreshTargetController = function () {
            var targetItem = this.getTargetItem();
            if ((targetItem == null)) {
                return;
            }
            if (targetItem.isFile()) {
                this.targetController = new FileController(targetItem);
                var ne = this.getNameExtension();
                this.namePart = ne[0];
                this.extensionPart = ne[1];
            }
            else if (targetItem.isDirectory()) {
                this.targetController = new DirectoryController(targetItem);
                this.namePart = this.item.getBaseName();
                this.extensionPart = null;
            }
            else {
                this.namePart = null;
                this.extensionPart = null;
            }
            return (this.targetController != null ? this.targetController.initialize(this.getItemView()) : undefined);
        };
        SymLinkController.prototype.performOpenAction = function () {
            return (this.targetController != null ? this.targetController.performOpenAction() : undefined);
        };
        return SymLinkController;
    }(ItemController)));
//# sourceMappingURL=symlink-controller.js.map