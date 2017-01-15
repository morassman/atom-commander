fsp = require 'fs-plus'
PathUtil = require 'path'
SimpleEncryptor = require 'simple-encryptor'
PasswordDialog = require './dialogs/password-dialog'
FileController = require './controllers/file-controller'
DiffView = require './views/diff/diff-view'
InputDialog = require './dialogs/input-dialog'

module.exports =
class Utils

  # Opens a DiffView with the given title. left and right can either
  # be a file or a string.
  @compareFiles: (title, tooltip, left, right) ->
    view = new DiffView(title, tooltip, left, right);
    pane = atom.workspace.getActivePane();
    item = pane.addItem(view, {index: 0});
    pane.activateItem(item);

  @getFirstFileViewItem: (viewItems) ->
    if viewItems == null
      return null;

    for viewItem in viewItems
      if viewItem.itemController instanceof FileController
        return viewItem;

    return null;

  @sortItems: (items) ->
    items.sort (item1, item2) ->
      name1 = item1.getBaseName();
      name2 = item2.getBaseName();

      if name1 < name2
        return -1;
      else if name1 > name2
        return 1;

      return 0;

  @getServersPath: ->
    return PathUtil.join(fsp.getHomeDirectory(), ".atom-commander", "servers");

  @promptForPassword: (prompt, callback) ->
    dialog = new InputDialog(prompt, null, true, callback);
    dialog.attach();

  @encrypt: (text, key) ->
    if !text or text.length == 0
      return text;

    return SimpleEncryptor(@padKey(key)).encrypt(text);

  @decrypt: (text, key) ->
    if !text or text.length == 0
      return text;

    return SimpleEncryptor(@padKey(key)).decrypt(text);

  @padKey: (key) ->
    while key.length < 16
      key += key;

    return key;

  @showWarning: (title, message, dismissable) ->
    options = {};
    options["dismissable"] = dismissable;

    if message?
      options["detail"] = message;

    atom.notifications.addWarning(title, options);

  @showErrorWarning: (title, pre, post, err, dismissable) ->
    message = "";

    if pre?
      message = pre;

    if err? and err.message?
      if message.length > 0
        message += "\n";

      message += err.message;

    if post?
      message += "\n"+post;

    @showWarning(title, message, dismissable);

  @resolveHome: (path) ->
    if path.length == 0
      return path;

    if path[0] == '~'
      return PathUtil.join(fsp.getHomeDirectory(), path.slice(1));

    return path;
