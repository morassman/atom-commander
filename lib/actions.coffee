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
ChildProcess = require 'child_process'
shell = require 'shell'

module.exports =
class Actions

  constructor: (@main) ->

  getFocusedView: ->
    focusedView = @main.getMainView()?.focusedView;

    if focusedView == null
      focusedView = @main.getMainView()?.getLeftView();

    return focusedView;

  selectAll: =>
    view = @getFocusedView();

    if view?
      view.selectAll();
      view.requestFocus();

  selectNone: =>
    view = @getFocusedView();

    if view?
      view.selectNone();
      view.requestFocus();

  selectAdd: =>
    @selectAddRemove(true);

  selectRemove: =>
    @selectAddRemove(false);

  selectAddRemove: (add) ->
    view = @getFocusedView();

    if view?
      view.requestFocus();
      dialog = new SelectDialog(@, view, add);
      dialog.attach();

  selectInvert: =>
    view = @getFocusedView();

    if view?
      view.selectInvert();
      view.requestFocus();

  selectFolders: =>
    view = @getFocusedView();

    if !view?
      return;

    view.requestFocus();

    for itemView in view.itemViews
      if itemView.isSelectable() and itemView.itemController instanceof DirectoryController
        itemView.select(true);

  selectFiles: =>
    view = @getFocusedView();

    if !view?
      return;

    view.requestFocus();

    for itemView in view.itemViews
      if itemView.isSelectable() and itemView.itemController instanceof FileController
        itemView.select(true);

  goHome: =>
    @goDirectory(new Directory(fsp.getHomeDirectory()));

  goRoot: =>
    @main.show(true);
    view = @getFocusedView();

    if !view?
      return;

    directory = view.directory;

    if !directory?
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
        file = @main.getLocalFileSystem().getFile(editor.getPath());
        @goFile(file, false);

  goPath: (path, openIfFile) =>
    if fsp.isDirectorySync(path)
      @goDirectory(new Directory(path));
      return;

    file = new File(path);

    if fsp.isFileSync(path)
      @goFile(file, openIfFile);
      return;

    directory = file.getParent();

    if fsp.isDirectorySync(directory.getPath())
      @goDirectory(directory);

  goFile: (file, open=false) =>
    @main.show(true);
    view = @getFocusedView();

    if view?
      snapShot = {};
      snapShot.name = file.getBaseName();

      @main.show(true);
      # view.requestFocus();
      view.openDirectory file.getParent(), snapShot, (err) =>
        if open
          file.open();

  goDirectory: (directory) =>
    @main.show(true);
    view = @getFocusedView();

    if view?
      @main.show(true);
      # view.requestFocus();
      view.openDirectory(directory);

  goDrive: (fromView=true) =>
    @main.getMainView()?.hideMenuBar();
    view = new DriveListView(@, fromView);

  goProject: (fromView=true) =>
    projects = atom.project.getDirectories();

    if projects.length == 0
      return;

    if projects.length == 1
      @goDirectory(projects[0]);
    else
      @main.getMainView()?.hideMenuBar();
      view = new ProjectListView(@, fromView);

  goBookmark: (bookmark) =>
    fileSystem = @main.getFileSystemWithID(bookmark.pathDescription.fileSystemId);

    if fileSystem == null
      return;

    item = fileSystem.getItemWithPathDescription(bookmark.pathDescription);

    if item.isFile()
      @goFile(item, true);
    else
      @goDirectory(item);

  viewRefresh: =>
    view = @getFocusedView();

    if view?
      view.refreshDirectory();

  viewMirror: =>
    @main.getMainView()?.mirror();

  viewSwap: =>
    @main.getMainView()?.swap();

  compareFolders: =>
    @main.getMainView().hideMenuBar();
    leftView = @main.getMainView()?.getLeftView();
    rightView = @main.getMainView()?.getRightView();

    if !leftView? or !rightView?
      return;

    leftView.selectNone();
    rightView.selectNone();

    for itemView in leftView.itemViews
      if rightView.getItemViewWithName(itemView.getName()) == null
        itemView.select(true);

    for itemView in rightView.itemViews
      if leftView.getItemViewWithName(itemView.getName()) == null
        itemView.select(true);

  compareFiles: =>
    @main.getMainView().hideMenuBar();
    leftView = @main.getMainView()?.getLeftView();
    rightView = @main.getMainView()?.getRightView();

    if !leftView? or !rightView?
      return;

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

    @main.getMainView().hideMenuBar();

    leftFile = leftViewItem.itemController.getFile();
    rightFile = rightViewItem.itemController.getFile();
    title = "Diff: "+leftFile.getBaseName()+" | "+rightFile.getBaseName();
    tooltip = leftFile.getPath()+" | "+rightFile.getPath();

    Utils.compareFiles(title, tooltip, leftFile, rightFile);

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

    if !view?
      return;

    itemView = view.getHighlightedItem();

    if !itemView?
      return;

    item = itemView.getItem();

    if !itemView.isSelectable()
      item = view.directory;

    @main.getMainView()?.hideMenuBar();
    dialog = new AddBookmarkDialog(@main, item.getBaseName(), item, fromView);
    dialog.attach();

  bookmarksRemove: (fromView=true) =>
    @main.getMainView()?.hideMenuBar();
    view = new BookmarksView(@, false, fromView);

  bookmarksOpen: (fromView=true) =>
    @main.getMainView()?.hideMenuBar();
    view = new BookmarksView(@, true, fromView);

  serversAdd: (fromView=true) =>
    view = @getFocusedView();

    if !view?
      return;

    @main.getMainView()?.hideMenuBar();
    dialog = new NewServerDialog(view);
    dialog.attach();

  serversRemove: (fromView=true) =>
    @main.getMainView()?.hideMenuBar();
    view = new ServersView(@, "remove", fromView);

  serversOpen: (fromView=true) =>
    @main.getMainView()?.hideMenuBar();
    view = new ServersView(@, "open", fromView);

  serversClose: (fromView=true) =>
    @main.getMainView()?.hideMenuBar();
    view = new ServersView(@, "close", fromView);

  serversCache: (fromView=true) =>
    @main.getMainView()?.hideMenuBar();
    view = new ServersView(@, "cache", fromView);

  serversEdit: (fromView=true) =>
    @main.getMainView()?.hideMenuBar();
    view = new ServersView(@, "edit", fromView);

  uploadFile: =>
    editor = atom.workspace.getActiveTextEditor();

    if !(editor instanceof TextEditor)
      return;

    if !editor.getPath()?
      return;

    serverManager = @main.getServerManager();
    watcher = serverManager.getWatcherWithLocalFilePath(editor.getPath());

    if watcher == null
      atom.notifications.addInfo(editor.getPath()+" doesn't have a server associated with it.");
      return;

    editor.save();

    # Only upload if saving will not automatically cause it to be uploaded.
    if !atom.config.get("atom-commander.uploadOnSave")
      watcher.upload();

  downloadFile: =>
    editor = atom.workspace.getActiveTextEditor();

    if !(editor instanceof TextEditor)
      return;

    if !editor.getPath()?
      return;

    serverManager = @main.getServerManager();
    watcher = serverManager.getWatcherWithLocalFilePath(editor.getPath());

    if watcher == null
      atom.notifications.addInfo(editor.getPath()+" doesn't have a server associated with it.");
      return;

    option = atom.confirm
      message: "Download"
      detailedMessage: "Replace the cached file with the remote one?"
      buttons: ["No", "Yes"]

    if option == 0
      return;

    file = watcher.getFile();
    file.download editor.getPath(), (err) =>
      if err?
        Utils.showErrorWarning("Download failed", "Error downloading "+file.getURI(), null, err, true);
      else
        atom.notifications.addSuccess("Downloaded "+file.getURI());

  compareWithServer: =>
    editor = atom.workspace.getActiveTextEditor();

    if !(editor instanceof TextEditor)
      return;

    if !editor.getPath()?
      return;

    serverManager = @main.getServerManager();
    watcher = serverManager.getWatcherWithLocalFilePath(editor.getPath());

    if watcher == null
      atom.notifications.addInfo(editor.getPath()+" doesn't have a server associated with it.");
      return;

    title = "Diff: "+editor.getTitle()+" | server";
    tooltip = watcher.getFile().getPath();
    Utils.compareFiles(title, tooltip, editor.getText(), watcher.getFile());

  openTerminal: =>
    @main.getMainView()?.hideMenuBar();
    view = @getFocusedView();

    if !view?
      return;

    directory = view.directory;
    folder = directory.getPath();

    if directory.isRemote()
      folder = view.getLastLocalPath();

    if process.platform == "darwin"
      command = "open -a Terminal";
      command += " \""+folder+"\"";
    else if process.platform == "win32"
      command = "start C:\\Windows\\System32\\cmd.exe";
      command += " \""+folder+"\"";
    else
      command = "/usr/bin/x-terminal-emulator";

    options = {};
    options.cwd = folder;

    ChildProcess.exec(command, options);

  openFileSystem: =>
    @openNative(true);

  openSystem: =>
    @openNative(false);

  openNative: (onlyShow) =>
    view = @getFocusedView();

    if !view?
      return;

    directory = view.directory;

    if directory.isRemote()
      atom.notifications.addWarning("This operation is only applicable to the local file system.");
      return;

    itemView = view.getHighlightedItem();

    if itemView == null
      return;

    @main.getMainView()?.hideMenuBar();

    if !itemView.isSelectable()
      shell.showItemInFolder(directory.getPath());
      return;

    item = itemView.getItem();

    if onlyShow
      shell.showItemInFolder(item.getPath());
      return;

    if item.isFile()
      shell.openItem(item.getPath());
    else
      shell.showItemInFolder(item.getPath());

  toggleSizeColumn: ->
    @main.getMainView()?.toggleSizeColumn();

  toggleDateColumn: ->
    @main.getMainView()?.toggleDateColumn();

  toggleExtensionColumn: ->
    @main.getMainView()?.toggleExtensionColumn();

  sortByName: ->
    @main.getMainView()?.setSortBy('name');

  sortByExtension: ->
    @main.getMainView()?.setSortBy('extension');

  sortBySize: ->
    @main.getMainView()?.setSortBy('size');

  sortByDate: ->
    @main.getMainView()?.setSortBy('date');

  sortByDefault: ->
    @main.getMainView()?.setSortBy(null);
