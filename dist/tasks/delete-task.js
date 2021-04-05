/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var fsp = require('fs-plus');
var fse = require('fs-extra');
var path = require('path');
module.exports = function (folderPath, names) {
    var callback = this.async();
    try {
        for (var _i = 0, _a = Array.from(names); _i < _a.length; _i++) {
            var name_1 = _a[_i];
            var p = path.join(folderPath, name_1);
            fse.removeSync(p);
        }
    }
    catch (error) {
        console.log("Error deleting.");
        console.error(error);
    }
    return callback();
};
//# sourceMappingURL=delete-task.js.map