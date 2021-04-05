/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var fsp = require('fs-plus');
var fse = require('fs-extra');
var path = require('path');
var _a = require('atom'), Directory = _a.Directory, File = _a.File;
module.exports = function (srcFolderPath, srcNames, dstFolderPath, move) {
    if (move == null) {
        move = false;
    }
    var callback = this.async();
    var dstDirectory = new Directory(dstFolderPath);
    try {
        var index = 0;
        for (var _i = 0, _a = Array.from(srcNames); _i < _a.length; _i++) {
            var srcName = _a[_i];
            var srcPath = path.join(srcFolderPath, srcName);
            var dstPath = path.join(dstFolderPath, srcName);
            var srcIsDir = fsp.isDirectorySync(srcPath);
            // Prevent a folder from being moved into itself.
            var stop_1 = move && (dstPath.indexOf(srcPath) === 0);
            var options = {};
            options.clobber = true;
            if (!stop_1) {
                // TODO : Prompt user to choose if file should be replaced.
                // The src will be copied if:
                // - src is a folder
                // - src is a file and dst isn't a file
                // if srcIsDir or !fsp.isFileSync(dstPath)
                if (move) {
                    fsp.moveSync(srcPath, dstPath);
                }
                else {
                    fse.copySync(srcPath, dstPath, options);
                }
                emit("success", { index: index });
            }
            index++;
        }
    }
    catch (error) {
        console.log("Error copying.");
        console.error(error);
    }
    return callback();
};
//# sourceMappingURL=copy-task.js.map