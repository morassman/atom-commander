Utils = require './utils'
FileController = require './controllers/file-controller'
DirectoryController = require './controllers/directory-controller'
DiffView = require './views/diff/diff-view'
SelectDialog = require './dialogs/select-dialog'
{File, Directory, TextEditor} = require 'atom'
fsp = require 'fs-plus'

module.exports =
class Actions

  constructor: (@main) ->

  getFocusedView: ->
    return @main.mainView.focusedView;

  selectAll: =>
    view = @getFocusedView();
    view?.selectAll();

  selectNone: =>
    view = @getFocusedView();
    view?.selectNone();

  selectAdd: =>
    @selectAddRemove(true);

  selectRemove: =>
    @selectAddRemove(false);

  selectAddRemove: (add) ->
    view = @getFocusedView();

    if (view == null)
      return;

    dialog = new SelectDialog(@, view, add);
    dialog.attach();

  selectInvert: =>
    view = @getFocusedView();
    view?.selectInvert();

  selectFolders: =>
    view = @getFocusedView();

    for itemView in view.itemViews
      if itemView.isSelectable() and itemView.itemController instanceof DirectoryController
        itemView.select(true);

  selectFiles: =>
    view = @getFocusedView();

    for itemView in view.itemViews
      if itemView.isSelectable() and itemView.itemController instanceof FileController
        itemView.select(true);

  goHome: =>
    @goDirectory(new Directory(fsp.getHomeDirectory()));

  goRoot: =>
    view = @getFocusedView();

    if (view == null)
      return;

    directory = view.directory;

    if (directory == null)
      return;

    while (!directory.isRoot())
      previousPath = directory.getPath();
      directory = directory.getParent();

      # Not sure if this is necessary, but it's just to prevent getting stuck
      # in case the root returns itself on certain platforms.
      if (previousPath == directory.getPath())
        break;

    @goDirectory(directory);

  goEditor: =>
    editor = atom.workspace.getActiveTextEditor();

    if editor instanceof TextEditor
      if editor.getPath()?
        @goFile(new File(editor.getPath()));

  goFile: (file) =>
    view = @getFocusedView();

    if (view != null)
      view.openDirectory(file.getParent());
      view.highlightIndexWithName(file.getBaseName());

  goDirectory: (directory) =>
    view = @getFocusedView();

    if (view != null)
      view.openDirectory(directory);

  viewMirror: =>
    @main.mainView.mirror();

  viewSwap: =>
    @main.mainView.swap();

  compareFolders: =>
    leftView = @main.mainView.leftView;
    rightView = @main.mainView.rightView;

    leftView.selectNone();
    rightView.selectNone();

    for itemView in leftView.itemViews
      if rightView.getItemViewWithName(itemView.getName()) == null
        itemView.select(true);

    for itemView in rightView.itemViews
      if leftView.getItemViewWithName(itemView.getName()) == null
        itemView.select(true);

  compareFiles: =>
    leftView = @main.mainView.leftView;
    rightView = @main.mainView.rightView;

    leftViewItem = Utils.getFirstFileViewItem(leftView.getSelectedItemViews(true));

    if (leftViewItem == null)
      return;

    rightViewItem = Utils.getFirstFileViewItem(rightView.getSelectedItemViews(true));

    if (rightViewItem == null)
      return;

    leftFile = leftViewItem.itemController.getFile();
    rightFile = rightViewItem.itemController.getFile();
    title = "Diff - "+leftFile.getBaseName()+" | "+rightFile.getBaseName();

    view = new DiffView(title, leftFile, rightFile);
    pane = atom.workspace.getActivePane();
    item = pane.addItem(view, 0);
    pane.activateItem(item);
