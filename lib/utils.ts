/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Utils;
const fsp = require('fs-plus');
const PathUtil = require('path');
const SimpleEncryptor = require('simple-encryptor');
const PasswordDialog = require('./dialogs/password-dialog');
const FileController = require('./controllers/file-controller');
const DiffView = require('./views/diff/diff-view');
const InputDialog = require('./dialogs/input-dialog');

module.exports =
(Utils = class Utils {

  // Opens a DiffView with the given title. left and right can either
  // be a file or a string.
  static compareFiles(title, tooltip, left, right) {
    const view = new DiffView(title, tooltip, left, right);
    const pane = atom.workspace.getActivePane();
    const item = pane.addItem(view, {index: 0});
    return pane.activateItem(item);
  }

  static getFirstFileViewItem(viewItems) {
    if (viewItems === null) {
      return null;
    }

    for (let viewItem of Array.from(viewItems)) {
      if (viewItem.itemController instanceof FileController) {
        return viewItem;
      }
    }

    return null;
  }

  static sortItems(items) {
    return items.sort(function(item1, item2) {
      const name1 = item1.getBaseName();
      const name2 = item2.getBaseName();

      if (name1 < name2) {
        return -1;
      } else if (name1 > name2) {
        return 1;
      }

      return 0;
    });
  }

  static getServersPath() {
    return PathUtil.join(fsp.getHomeDirectory(), ".atom-commander", "servers");
  }

  static promptForPassword(prompt, callback) {
    const dialog = new InputDialog(prompt, null, true, callback);
    return dialog.attach();
  }

  static encrypt(text, key) {
    if (!text || (text.length === 0)) {
      return text;
    }

    return SimpleEncryptor(this.padKey(key)).encrypt(text);
  }

  static decrypt(text, key) {
    if (!text || (text.length === 0)) {
      return text;
    }

    return SimpleEncryptor(this.padKey(key)).decrypt(text);
  }

  static padKey(key) {
    while (key.length < 16) {
      key += key;
    }

    return key;
  }

  static showWarning(title, message, dismissable) {
    const options = {};
    options["dismissable"] = dismissable;

    if (message != null) {
      options["detail"] = message;
    }

    return atom.notifications.addWarning(title, options);
  }

  static showErrorWarning(title, pre, post, err, dismissable) {
    let message = "";

    if (pre != null) {
      message = pre;
    }

    if ((err != null) && (err.message != null)) {
      if (message.length > 0) {
        message += "\n";
      }

      message += err.message;
    }

    if (post != null) {
      message += "\n"+post;
    }

    return this.showWarning(title, message, dismissable);
  }

  static resolveHome(path) {
    if (path.length === 0) {
      return path;
    }

    if (path[0] === '~') {
      return PathUtil.join(fsp.getHomeDirectory(), path.slice(1));
    }

    return path;
  }

  // @dirs true if the items are directories. false if files.
  // @item Array of BaseItemView to sort.
  // @sortBy Attribute to sort by : 'name', 'ext', 'size', 'date'
  // @ascending true to sort ascending. false for descending.
  static sortItemViews(dirs, items, sortBy, ascending) {
    if (sortBy === 'name') {
      items.sort(this.itemViewNameComparator);
    } else if (sortBy === 'date') {
      items.sort(this.itemViewDateComparator);
    }

    if (!dirs) {
      if (sortBy === 'extension') {
        items.sort(this.itemViewExtensionComparator);
      } else if (sortBy === 'size') {
        items.sort(this.itemViewSizeComparator);
      }
    }

    if (!ascending) {
      return items.reverse();
    }
  }


  static itemViewNameComparator(a, b?) {
    const na = a.itemController.getNamePart();
    const nb = b.itemController.getNamePart();

    if (na < nb) {
      return -1;
    }

    if (na > nb) {
      return 1;
    }

    return 0;
  }

  static itemViewExtensionComparator(a, b?) {
    const na = a.itemController.getExtensionPart();
    const nb = b.itemController.getExtensionPart();

    if (na < nb) {
      return -1;
    }

    if (na > nb) {
      return 1;
    }

    return 0;
  }

  static itemViewSizeComparator(a, b?) {
    const na = a.getItem().getSize();
    const nb = b.getItem().getSize();

    if (na < nb) {
      return -1;
    }

    if (na > nb) {
      return 1;
    }

    return 0;
  }

  static itemViewDateComparator(a, b?) {
    const na = a.getItem().getModifyDate();
    const nb = b.getItem().getModifyDate();

    if (na < nb) {
      return -1;
    }

    if (na > nb) {
      return 1;
    }

    return 0;
  }
});
