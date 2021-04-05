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
var StatusView;
var View = require('atom-space-pen-views').View;
module.exports =
    (StatusView = /** @class */ (function (_super) {
        __extends(StatusView, _super);
        function StatusView() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        StatusView.content = function () {
            var _this = this;
            return this.div({ "class": "inline-block" }, function () {
                _this.span("0", { "class": "icon icon-cloud-download", outlet: "download" });
                return _this.span("0", { "class": "icon icon-cloud-upload", outlet: "upload" });
            });
        };
        StatusView.prototype.initialize = function () {
            this.uploadCount = 0;
            this.downloadCount = 0;
            this.hide();
            this.upload.hide();
            return this.download.hide();
        };
        StatusView.prototype.setUploadCount = function (uploadCount) {
            this.uploadCount = uploadCount;
            this.upload.text(this.uploadCount);
            return this.refreshVisible();
        };
        StatusView.prototype.setDownloadCount = function (downloadCount) {
            this.downloadCount = downloadCount;
            this.download.text(this.downloadCount);
            return this.refreshVisible();
        };
        StatusView.prototype.refreshVisible = function () {
            if ((this.uploadCount + this.downloadCount) === 0) {
                return this.hide();
            }
            else {
                if (this.uploadCount === 0) {
                    this.upload.hide();
                }
                else {
                    this.upload.show();
                }
                if (this.downloadCount === 0) {
                    this.download.hide();
                }
                else {
                    this.download.show();
                }
                return this.show();
            }
        };
        return StatusView;
    }(View)));
//# sourceMappingURL=status-view.js.map