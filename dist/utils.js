"use strict";
exports.__esModule = true;
var fsp = require('fs-plus');
var PathUtil = require('path');
var SimpleEncryptor = require('simple-encryptor');
var PasswordDialog = require('./dialogs/password-dialog');
var FileController = require('./controllers/file-controller');
var DiffView = require('./views/diff/diff-view');
var InputDialog = require('./dialogs/input-dialog');
exports["default"] = {
    // Opens a DiffView with the given title. left and right can either
    // be a file or a string.
    compareFiles: function (title, tooltip, left, right) {
        var view = new DiffView(title, tooltip, left, right);
        var pane = atom.workspace.getActivePane();
        var item = pane.addItem(view, { index: 0 });
        return pane.activateItem(item);
    },
    getFirstFileViewItem: function (viewItems) {
        if (viewItems === null) {
            return null;
        }
        for (var _i = 0, _a = Array.from(viewItems); _i < _a.length; _i++) {
            var viewItem = _a[_i];
            if (viewItem.itemController instanceof FileController) {
                return viewItem;
            }
        }
        return null;
    },
    sortItems: function (items) {
        return items.sort(function (item1, item2) {
            var name1 = item1.getBaseName();
            var name2 = item2.getBaseName();
            if (name1 < name2) {
                return -1;
            }
            else if (name1 > name2) {
                return 1;
            }
            return 0;
        });
    },
    getServersPath: function () {
        return PathUtil.join(fsp.getHomeDirectory(), '.atom-commander', 'servers');
    },
    promptForPassword: function (prompt, callback) {
        var dialog = new InputDialog(prompt, null, true, callback);
        return dialog.attach();
    },
    encrypt: function (text, key) {
        if (!text || (text.length === 0)) {
            return text;
        }
        return SimpleEncryptor(this.padKey(key)).encrypt(text);
    },
    decrypt: function (text, key) {
        if (!text || (text.length === 0)) {
            return text;
        }
        return SimpleEncryptor(this.padKey(key)).decrypt(text);
    },
    padKey: function (key) {
        while (key.length < 16) {
            key += key;
        }
        return key;
    },
    showWarning: function (title, message, dismissable) {
        var options = {};
        options['dismissable'] = dismissable;
        if (message != null) {
            options['detail'] = message;
        }
        return atom.notifications.addWarning(title, options);
    },
    showErrorWarning: function (title, pre, post, err, dismissable) {
        var message = '';
        if (pre != null) {
            message = pre;
        }
        if ((err != null) && (err.message != null)) {
            if (message.length > 0) {
                message += '\n';
            }
            message += err.message;
        }
        if (post != null) {
            message += '\n' + post;
        }
        return this.showWarning(title, message, dismissable);
    },
    resolveHome: function (path) {
        if (path.length === 0) {
            return path;
        }
        if (path[0] === '~') {
            return PathUtil.join(fsp.getHomeDirectory(), path.slice(1));
        }
        return path;
    },
    // @dirs true if the items are directories. false if files.
    // @item Array of BaseItemView to sort.
    // @sortBy Attribute to sort by : 'name', 'ext', 'size', 'date'
    // @ascending true to sort ascending. false for descending.
    sortItemViews: function (dirs, items, sortBy, ascending) {
        if (sortBy === 'name') {
            items.sort(this.itemViewNameComparator);
        }
        else if (sortBy === 'date') {
            items.sort(this.itemViewDateComparator);
        }
        if (!dirs) {
            if (sortBy === 'extension') {
                items.sort(this.itemViewExtensionComparator);
            }
            else if (sortBy === 'size') {
                items.sort(this.itemViewSizeComparator);
            }
        }
        if (!ascending) {
            return items.reverse();
        }
    },
    itemViewNameComparator: function (a, b) {
        var na = a.itemController.getNamePart();
        var nb = b.itemController.getNamePart();
        if (na < nb) {
            return -1;
        }
        if (na > nb) {
            return 1;
        }
        return 0;
    },
    itemViewExtensionComparator: function (a, b) {
        var na = a.itemController.getExtensionPart();
        var nb = b.itemController.getExtensionPart();
        if (na < nb) {
            return -1;
        }
        if (na > nb) {
            return 1;
        }
        return 0;
    },
    itemViewSizeComparator: function (a, b) {
        var na = a.getItem().getSize();
        var nb = b.getItem().getSize();
        if (na < nb) {
            return -1;
        }
        if (na > nb) {
            return 1;
        }
        return 0;
    },
    itemViewDateComparator: function (a, b) {
        var na = a.getItem().getModifyDate();
        var nb = b.getItem().getModifyDate();
        if (na < nb) {
            return -1;
        }
        if (na > nb) {
            return 1;
        }
        return 0;
    }
};
//# sourceMappingURL=utils.js.map