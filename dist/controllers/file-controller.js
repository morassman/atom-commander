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
var FileController;
var ItemController = require('./item-controller');
module.exports =
    (FileController = /** @class */ (function (_super) {
        __extends(FileController, _super);
        function FileController(file) {
            return _super.call(this, file) || this;
        }
        FileController.prototype.getFile = function () {
            return this.item;
        };
        FileController.prototype.getNamePart = function () {
            if ((this.namePart == null)) {
                this.refreshNameExtension();
            }
            return this.namePart;
        };
        FileController.prototype.getExtensionPart = function () {
            if ((this.extensionPart == null)) {
                this.refreshNameExtension();
            }
            return this.extensionPart;
        };
        FileController.prototype.refreshNameExtension = function () {
            var ne = this.getNameExtension();
            this.namePart = ne[0];
            return this.extensionPart = ne[1];
        };
        FileController.prototype.performOpenAction = function () {
            return this.getFile().open();
        };
        return FileController;
    }(ItemController)));
//# sourceMappingURL=file-controller.js.map