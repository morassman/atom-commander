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
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var NewDirectoryDialog;
var fs = require('fs-plus');
var InputDialog = require('@aki77/atom-input-dialog');
module.exports =
    (NewDirectoryDialog = /** @class */ (function (_super) {
        __extends(NewDirectoryDialog, _super);
        function NewDirectoryDialog(containerView, directory) {
            var _this = this;
            _this.containerView = containerView;
            _this.directory = directory;
            _this = _super.call(this, { prompt: "Enter a name for the new folder:" }) || this;
            return _this;
        }
        NewDirectoryDialog.prototype.initialize = function () {
            var _this = this;
            var options = {};
            var pathUtil = this.directory.getFileSystem().getPathUtil();
            options.callback = function (text) {
                var name = text.trim();
                var path = pathUtil.join(_this.directory.getPath(), name);
                return _this.directory.fileSystem.makeDirectory(path, function (err) {
                    if (err != null) {
                        return atom.notifications.addWarning(err);
                    }
                    else {
                        var snapShot = {};
                        snapShot.name = name;
                        return _this.containerView.refreshDirectoryWithSnapShot(snapShot);
                    }
                });
            };
            options.validate = function (text) {
                var name = text.trim();
                if (name.length === 0) {
                    return "The folder name may not be empty.";
                }
                if (this.directory.fileSystem.isLocal()) {
                    if (fs.isDirectorySync(pathUtil.join(this.directory.getPath(), name))) {
                        return "A folder with this name already exists.";
                    }
                }
                return null;
            };
            return _super.prototype.initialize.call(this, options);
        };
        return NewDirectoryDialog;
    }(InputDialog)));
//# sourceMappingURL=new-directory-dialog.js.map