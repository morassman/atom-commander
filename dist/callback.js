/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var Callback;
module.exports =
    (Callback = /** @class */ (function () {
        function Callback(wrappedCallback) {
            this.wrappedCallback = wrappedCallback;
            this.cancelled = false;
        }
        Callback.prototype.cancel = function () {
            return this.cancelled = true;
        };
        Callback.prototype.callback = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (!this.cancelled) {
                return this.wrappedCallback(args);
            }
        };
        return Callback;
    }()));
//# sourceMappingURL=callback.js.map