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
var HistoryView;
var _a = require('atom-space-pen-views'), $ = _a.$, View = _a.View;
module.exports =
    (HistoryView = /** @class */ (function (_super) {
        __extends(HistoryView, _super);
        function HistoryView() {
            return _super.call(this) || this;
        }
        HistoryView.content = function () {
            var _this = this;
            return this.div({ "class": "history-panel popover-list select-list" }, function () {
                return _this.ol({ id: "itemList", "class": "history-list list-group", style: "margin: 0", outlet: "itemList" });
            });
        };
        HistoryView.prototype.initialize = function () {
            var _this = this;
            this.hide();
            this.clickHandler = function (e) {
                if ((e.target.id !== 'itemList') && !_this.itemList.find(e.target).length) {
                    return _this.close();
                }
            };
            this.on('mousedown', '.list-item', function (e) {
                _this.hide();
                return _this.containerView.setDirectory(e.target.textContent);
            });
            return this.itemList.append($("<li class='history-list-item list-item'>/Users/henkmarais/github</li>"));
        };
        HistoryView.prototype.toggle = function () {
            if (this.isVisible()) {
                return this.close();
            }
            else {
                return this.open();
            }
        };
        HistoryView.prototype.isVisible = function () {
            return this.is(":visible");
        };
        HistoryView.prototype.open = function () {
            // @itemList.empty();
            this.show();
            this.itemList.focus();
            return $(document).on('click', this.clickHandler);
        };
        HistoryView.prototype.close = function () {
            this.hide();
            return $(document).off('click', this.clickHandler);
        };
        HistoryView.prototype.setContainerView = function (containerView) {
            this.containerView = containerView;
            if (this.containerView.isLeft()) {
                return this.addClass("left-history-panel");
            }
            else {
                return this.addClass("right-history-panel");
            }
        };
        HistoryView.prototype.refreshItems = function () { };
        return HistoryView;
    }(View)));
//# sourceMappingURL=history-view.js.map