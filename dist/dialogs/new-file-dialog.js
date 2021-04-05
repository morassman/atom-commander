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
var NewFileDialog;
var fs = require('fs-plus');
var InputDialog = require('@aki77/atom-input-dialog');
var Utils = require('../utils');
module.exports =
    (NewFileDialog = /** @class */ (function (_super) {
        __extends(NewFileDialog, _super);
        function NewFileDialog(containerView, directory, existingNames) {
            var _this = this;
            _this.containerView = containerView;
            _this.directory = directory;
            _this.existingNames = existingNames;
            _this = _super.call(this, { prompt: 'Enter a name for the new file:' }) || this;
            return _this;
        }
        NewFileDialog.prototype.initialize = function () {
            var _this = this;
            var options = {};
            options.callback = function (text) {
                var name = text.trim();
                return _this.directory.newFile(name, function (file, err) {
                    if (file !== null) {
                        _this.containerView.refreshDirectory();
                        _this.containerView.highlightIndexWithName(file.getBaseName());
                        return file.open();
                    }
                    else {
                        return Utils.showErrorWarning("Unable to create file " + name, null, null, err, true);
                    }
                });
            };
            options.validate = function (text) {
                var name = text.trim();
                if (name.length === 0) {
                    return 'The file name may not be empty.';
                }
                if (this.existingNames.indexOf(name) >= 0) {
                    return 'A file or folder with this name already exists.';
                }
                return null;
            };
            return _super.prototype.initialize.call(this, options);
        };
        return NewFileDialog;
    }(InputDialog)));
//# sourceMappingURL=new-file-dialog.js.map