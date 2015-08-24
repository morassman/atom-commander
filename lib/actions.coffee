Utils = require './utils'
FileController = require './controllers/file-controller'
DirectoryController = require './controllers/directory-controller'
DiffView = require './views/diff/diff-view'

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
