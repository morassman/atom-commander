/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var Buffer;
module.exports =
    (Buffer = /** @class */ (function () {
        function Buffer(maxSize) {
            this.maxSize = maxSize;
            this.size = 0;
            this.array = [];
        }
        Buffer.prototype.push = function (data) {
            var _this = this;
            this.size += data.length;
            this.array.push(data);
            if ((this.maxSize == null)) {
                return;
            }
            return (function () {
                var result = [];
                while (_this.size > _this.maxSize) {
                    var diff = _this.size - _this.maxSize;
                    if (diff < _this.array[0].length) {
                        _this.array[0] = _this.array[0].slice(diff);
                        result.push(_this.size -= diff);
                    }
                    else {
                        var discard = _this.array.shift();
                        result.push(_this.size -= discard.length);
                    }
                }
                return result;
            })();
        };
        Buffer.prototype.clear = function () {
            this.size = 0;
            return this.array = [];
        };
        Buffer.prototype.getLineCount = function () {
            return this.array.length;
        };
        Buffer.prototype.toString = function () {
            return this.array.join("");
        };
        return Buffer;
    }()));
//# sourceMappingURL=buffer.js.map