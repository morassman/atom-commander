Utils = require './utils'
FileController = require './controllers/file-controller'
DirectoryController = require './controllers/directory-controller'
BookmarksView = require './views/bookmarks-view'
DriveListView = require './views/drive-list-view'
ProjectListView = require './views/project-list-view'
ServersView = require './views/servers-view'
AddBookmarkDialog = require './dialogs/add-bookmark-dialog'
SelectDialog = require './dialogs/select-dialog'
NewServerDialog = require './dialogs/new-server-dialog'
{File, Directory, TextEditor} = require 'atom'
fsp = require 'fs-plus'

module.exports =
class Actions

  constructor: (@main) ->

  getFocusedView: ->
    focusedView = @main.mainView.focusedView;

    if focusedView == null
      focusedView = @main.mainView.leftView;

    return focusedView;

  selectAll: =>
    view = @getFocusedView();

    if view != null
      view.selectAll();
      view.requestFocus();

  selectNone: =>
    view = @getFocusedView();

    if view != null
      view.selectNone();
      view.requestFocus();

  selectAdd: =>
    @selectAddRemove(true);

  selectRemove: =>
    @selectAddRemove(false);

  selectAddRemove: (add) ->
    view = @getFocusedView();

    if (view != null)
      view.requestFocus();
      dialog = new SelectDialog(@, view, add);
      dialog.attach();

  selectInvert: =>
    view = @getFocusedView();

    if (view != null)
      view.selectInvert();
      view.requestFocus();

  selectFolders: =>
    view = @getFocusedView();

    if (view == null)
      return;

    view.requestFocus();

    for itemView in view.itemViews
      if itemView.isSelectable() and itemView.itemController instanceof DirectoryController
        itemView.select(true);

  selectFiles: =>
    view = @getFocusedView();

    if (view == null)
      return;

    view.requestFocus();

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

  goPath: (path, openIfFile) =>
    if fsp.isDirectorySync(path)
      @goDirectory(new Directory(path));
      return;

    file = new File(path);

    if fsp.isFileSync(path)
      @goFile(file);

      if openIfFile
        atom.workspace.open(file.getPath());

      return;

    directory = file.getParent();

    if fsp.isDirectorySync(directory.getPath())
      @goDirectory(directory);

  goFile: (file) =>
    view = @getFocusedView();

    if (view != null)
      snapShot = {};
      snapShot.name = file.getBaseName();

      view.requestFocus();
      view.openDirectory(file.getParent(), snapShot);

  goDirectory: (directory) =>
    view = @getFocusedView();

    if (view != null)
      view.requestFocus();
      view.openDirectory(directory);

  goDrive: (fromView=true) =>
    @main.mainView.hideMenuBar();
    view = new DriveListView(@, fromView);

  goProject: (fromView=true) =>
    projects = atom.project.getDirectories();

    if projects.length == 0
      return;

    if projects.length == 1
      @goDirectory(projects[0]);
    else
      @main.mainView.hideMenuBar();
      view = new ProjectListView(@, fromView);

  goBookmark: (bookmark) =>
    fileSystem = @main.getFileSystemWithID(bookmark.pathDescription.fileSystemId);

    if fileSystem == null
      return;

    item = fileSystem.getItemWithPathDescription(bookmark.pathDescription);

    if item.isFile()
      @goFile(item);
      item.open();
    else
      @goDirectory(item);

  viewRefresh: =>
    view = @getFocusedView();

    if (view != null)
      view.refreshDirectory();

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

    leftViewItem = leftView.getHighlightedItem();

    if (leftViewItem == null)
      return;

    rightViewItem = rightView.getHighlightedItem();

    if (rightViewItem == null)
      return;

    if !(leftViewItem.itemController instanceof FileController)
      return;

    if !(rightViewItem.itemController instanceof FileController)
      return;

    # leftViewItem = Utils.getFirstFileViewItem(leftView.getSelectedItemViews(true));
    #
    # if (leftViewItem == null)
    #   return;
    #
    # rightViewItem = Utils.getFirstFileViewItem(rightView.getSelectedItemViews(true));
    #
    # if (rightViewItem == null)
    #   return;

    leftFile = leftViewItem.itemController.getFile();
    rightFile = rightViewItem.itemController.getFile();
    title = "Diff: "+leftFile.getBaseName()+" | "+rightFile.getBaseName();

    Utils.compareFiles(title, leftFile, rightFile);

  bookmarksAddEditor: =>
    editor = atom.workspace.getActiveTextEditor();

    if editor instanceof TextEditor
      if editor.getPath()?
        @bookmarksAddLocalFilePath(editor.getPath());

  bookmarksAddLocalFilePath: (path) =>
    file = @main.getLocalFileSystem().getFile(path);

    # If the file is being watched then add a remote bookmark instead.
    serverManager = @main.getServerManager();
    watcher = serverManager.getWatcherWithLocalFilePath(path);

    if watcher != null
      file = watcher.getFile();

    dialog = new AddBookmarkDialog(@main, file.getBaseName(), file, false);
    dialog.attach();

  bookmarksAdd: (fromView=true) =>
    view = @getFocusedView();

    if (view == null)
      return;

    itemView = view.getHighlightedItem();

    if (itemView == null)
      return;

    item = itemView.getItem();

    if !itemView.isSelectable()
      item = view.directory;

    @main.mainView.hideMenuBar();
    dialog = new AddBookmarkDialog(@main, item.getBaseName(), item, fromView);
    dialog.attach();

  bookmarksRemove: (fromView=true) =>
    @main.mainView.hideMenuBar();
    view = new BookmarksView(@, false, fromView);

  bookmarksOpen: (fromView=true) =>
    @main.mainView.hideMenuBar();
    view = new BookmarksView(@, true, fromView);

  serversAdd: (fromView=true) =>
    view = @getFocusedView();

    if view == null
      return;

    @main.mainView.hideMenuBar();
    dialog = new NewServerDialog(view);
    dialog.attach();

  serversRemove: (fromView=true) =>
    @main.mainView.hideMenuBar();
    view = new ServersView(@, "remove", fromView);

  serversOpen: (fromView=true) =>
    @main.mainView.hideMenuBar();
    view = new ServersView(@, "open", fromView);

  serversCache: (fromView=true) =>
    @main.mainView.hideMenuBar();
    view = new ServersView(@, "cache", fromView);
