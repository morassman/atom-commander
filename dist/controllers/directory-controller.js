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
var DirectoryController;
var ItemController = require('./item-controller');
module.exports =
    (DirectoryController = /** @class */ (function (_super) {
        __extends(DirectoryController, _super);
        function DirectoryController(directory) {
            return _super.call(this, directory) || this;
        }
        DirectoryController.prototype.getDirectory = function () {
            return this.item;
        };
        DirectoryController.prototype.performOpenAction = function () {
            return this.getContainerView().openDirectory(this.getDirectory());
        };
        return DirectoryController;
    }(ItemController)));
//# sourceMappingURL=directory-controller.js.map