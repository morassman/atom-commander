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
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var PasswordDialog;
var InputDialog = require('@aki77/atom-input-dialog');
module.exports =
    (PasswordDialog = /** @class */ (function (_super) {
        __extends(PasswordDialog, _super);
        function PasswordDialog(prompt, callback) {
            var _this = this;
            _this.callback = callback;
            _this = _super.call(this, { prompt: prompt }) || this;
            return _this;
        }
        PasswordDialog.prototype.initialize = function () {
            var options = {};
            options.callback = this.callback;
            options.validate = function (text) { return null; };
            _super.prototype.initialize.call(this, options);
            return this.miniEditor.addClass("atom-commander-password");
        };
        return PasswordDialog;
    }(InputDialog)));
//# sourceMappingURL=password-dialog.js.map