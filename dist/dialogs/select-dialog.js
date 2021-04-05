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
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var SelectDialog;
var InputDialog = require('@aki77/atom-input-dialog');
module.exports =
    (SelectDialog = /** @class */ (function (_super) {
        __extends(SelectDialog, _super);
        function SelectDialog(actions, containerView, add) {
            var _this = this;
            _this.actions = actions;
            _this.containerView = containerView;
            _this.add = add;
            if (_this.add) {
                _this = _super.call(this, { prompt: 'Select items that matches pattern:' }) || this;
            }
            else {
                _this = _super.call(this, { prompt: 'Deselect items that matches pattern:' }) || this;
            }
            return _this;
        }
        SelectDialog.prototype.initialize = function () {
            var _this = this;
            var options = {};
            options.defaultText = "*";
            options.callback = function (text) {
                var pattern = text.trim();
                var itemViews = _this.containerView.getItemViewsWithPattern(pattern);
                return (function () {
                    var result = [];
                    for (var _i = 0, _a = Array.from(itemViews); _i < _a.length; _i++) {
                        var itemView = _a[_i];
                        if (itemView.isSelectable()) {
                            result.push(itemView.select(_this.add));
                        }
                        else {
                            result.push(undefined);
                        }
                    }
                    return result;
                })();
            };
            options.validate = function (text) {
                var pattern = text.trim();
                if (pattern.length === 0) {
                    return 'The pattern may not be empty.';
                }
            };
            return _super.prototype.initialize.call(this, options);
        };
        return SelectDialog;
    }(InputDialog)));
//# sourceMappingURL=select-dialog.js.map