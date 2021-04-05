/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__, or convert again using --optional-chaining
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var Actions;
var Utils = require('./utils');
var FileController = require('./controllers/file-controller');
var DirectoryController = require('./controllers/directory-controller');
var BookmarksView = require('./views/bookmarks-view');
var DriveListView = require('./views/drive-list-view');
var ProjectListView = require('./views/project-list-view');
var ServersView = require('./views/servers-view');
var AddBookmarkDialog = require('./dialogs/add-bookmark-dialog');
var SelectDialog = require('./dialogs/select-dialog');
var NewServerDialog = require('./dialogs/new-server-dialog');
var _a = require('atom'), File = _a.File, Directory = _a.Directory, TextEditor = _a.TextEditor;
var fsp = require('fs-plus');
var ChildProcess = require('child_process');
var shell = require('shell');
module.exports =
    (Actions = /** @class */ (function () {
        function Actions(main) {
            this.selectAll = this.selectAll.bind(this);
            this.selectNone = this.selectNone.bind(this);
            this.selectAdd = this.selectAdd.bind(this);
            this.selectRemove = this.selectRemove.bind(this);
            this.selectInvert = this.selectInvert.bind(this);
            this.selectFolders = this.selectFolders.bind(this);
            this.selectFiles = this.selectFiles.bind(this);
            this.goHome = this.goHome.bind(this);
            this.goRoot = this.goRoot.bind(this);
            this.goEditor = this.goEditor.bind(this);
            this.goPath = this.goPath.bind(this);
            this.goFile = this.goFile.bind(this);
            this.goDirectory = this.goDirectory.bind(this);
            this.goDrive = this.goDrive.bind(this);
            this.goProject = this.goProject.bind(this);
            this.goBookmark = this.goBookmark.bind(this);
            this.viewRefresh = this.viewRefresh.bind(this);
            this.viewMirror = this.viewMirror.bind(this);
            this.viewSwap = this.viewSwap.bind(this);
            this.compareFolders = this.compareFolders.bind(this);
            this.compareFiles = this.compareFiles.bind(this);
            this.bookmarksAddEditor = this.bookmarksAddEditor.bind(this);
            this.bookmarksAddLocalFilePath = this.bookmarksAddLocalFilePath.bind(this);
            this.bookmarksAdd = this.bookmarksAdd.bind(this);
            this.bookmarksRemove = this.bookmarksRemove.bind(this);
            this.bookmarksOpen = this.bookmarksOpen.bind(this);
            this.serversAdd = this.serversAdd.bind(this);
            this.serversRemove = this.serversRemove.bind(this);
            this.serversOpen = this.serversOpen.bind(this);
            this.serversClose = this.serversClose.bind(this);
            this.serversCache = this.serversCache.bind(this);
            this.serversEdit = this.serversEdit.bind(this);
            this.uploadFile = this.uploadFile.bind(this);
            this.downloadFile = this.downloadFile.bind(this);
            this.compareWithServer = this.compareWithServer.bind(this);
            this.openTerminal = this.openTerminal.bind(this);
            this.openFileSystem = this.openFileSystem.bind(this);
            this.openSystem = this.openSystem.bind(this);
            this.openNative = this.openNative.bind(this);
            this.main = main;
        }
        Actions.prototype.getFocusedView = function () {
            var focusedView = __guard__(this.main.getMainView(), function (x) { return x.focusedView; });
            if (focusedView === null) {
                focusedView = __guard__(this.main.getMainView(), function (x1) { return x1.getLeftView(); });
            }
            return focusedView;
        };
        Actions.prototype.selectAll = function () {
            var view = this.getFocusedView();
            if (view != null) {
                view.selectAll();
                return view.requestFocus();
            }
        };
        Actions.prototype.selectNone = function () {
            var view = this.getFocusedView();
            if (view != null) {
                view.selectNone();
                return view.requestFocus();
            }
        };
        Actions.prototype.selectAdd = function () {
            return this.selectAddRemove(true);
        };
        Actions.prototype.selectRemove = function () {
            return this.selectAddRemove(false);
        };
        Actions.prototype.selectAddRemove = function (add) {
            var view = this.getFocusedView();
            if (view != null) {
                view.requestFocus();
                var dialog = new SelectDialog(this, view, add);
                return dialog.attach();
            }
        };
        Actions.prototype.selectInvert = function () {
            var view = this.getFocusedView();
            if (view != null) {
                view.selectInvert();
                return view.requestFocus();
            }
        };
        Actions.prototype.selectFolders = function () {
            var view = this.getFocusedView();
            if ((view == null)) {
                return;
            }
            view.requestFocus();
            return (function () {
                var result = [];
                for (var _i = 0, _a = Array.from(view.itemViews); _i < _a.length; _i++) {
                    var itemView = _a[_i];
                    if (itemView.isSelectable() && itemView.itemController instanceof DirectoryController) {
                        result.push(itemView.select(true));
                    }
                    else {
                        result.push(undefined);
                    }
                }
                return result;
            })();
        };
        Actions.prototype.selectFiles = function () {
            var view = this.getFocusedView();
            if ((view == null)) {
                return;
            }
            view.requestFocus();
            return (function () {
                var result = [];
                for (var _i = 0, _a = Array.from(view.itemViews); _i < _a.length; _i++) {
                    var itemView = _a[_i];
                    if (itemView.isSelectable() && itemView.itemController instanceof FileController) {
                        result.push(itemView.select(true));
                    }
                    else {
                        result.push(undefined);
                    }
                }
                return result;
            })();
        };
        Actions.prototype.goHome = function () {
            return this.goDirectory(new Directory(fsp.getHomeDirectory()));
        };
        Actions.prototype.goRoot = function () {
            this.main.show(true);
            var view = this.getFocusedView();
            if ((view == null)) {
                return;
            }
            var directory = view.directory;
            if ((directory == null)) {
                return;
            }
            while (!directory.isRoot()) {
                var previousPath = directory.getPath();
                directory = directory.getParent();
                // Not sure if this is necessary, but it's just to prevent getting stuck
                // in case the root returns itself on certain platforms.
                if (previousPath === directory.getPath()) {
                    break;
                }
            }
            return this.goDirectory(directory);
        };
        Actions.prototype.goEditor = function () {
            var editor = atom.workspace.getActiveTextEditor();
            if (editor instanceof TextEditor) {
                if (editor.getPath() != null) {
                    var file = this.main.getLocalFileSystem().getFile(editor.getPath());
                    return this.goFile(file, false);
                }
            }
        };
        Actions.prototype.goPath = function (path, openIfFile) {
            if (fsp.isDirectorySync(path)) {
                this.goDirectory(new Directory(path));
                return;
            }
            var file = new File(path);
            if (fsp.isFileSync(path)) {
                this.goFile(file, openIfFile);
                return;
            }
            var directory = file.getParent();
            if (fsp.isDirectorySync(directory.getPath())) {
                return this.goDirectory(directory);
            }
        };
        Actions.prototype.goFile = function (file, open) {
            if (open == null) {
                open = false;
            }
            this.main.show(true);
            var view = this.getFocusedView();
            if (view != null) {
                var snapShot = {};
                snapShot.name = file.getBaseName();
                this.main.show(true);
                // view.requestFocus();
                return view.openDirectory(file.getParent(), snapShot, function (err) {
                    if (open) {
                        return file.open();
                    }
                });
            }
        };
        Actions.prototype.goDirectory = function (directory) {
            this.main.show(true);
            var view = this.getFocusedView();
            if (view != null) {
                this.main.show(true);
                // view.requestFocus();
                return view.openDirectory(directory);
            }
        };
        Actions.prototype.goDrive = function (fromView) {
            var view;
            if (fromView == null) {
                fromView = true;
            }
            __guard__(this.main.getMainView(), function (x) { return x.hideMenuBar(); });
            return view = new DriveListView(this, fromView);
        };
        Actions.prototype.goProject = function (fromView) {
            if (fromView == null) {
                fromView = true;
            }
            var projects = atom.project.getDirectories();
            if (projects.length === 0) {
                return;
            }
            if (projects.length === 1) {
                return this.goDirectory(projects[0]);
            }
            else {
                var view = void 0;
                __guard__(this.main.getMainView(), function (x) { return x.hideMenuBar(); });
                return view = new ProjectListView(this, fromView);
            }
        };
        Actions.prototype.goBookmark = function (bookmark) {
            var fileSystem = this.main.getFileSystemWithID(bookmark.pathDescription.fileSystemId);
            if (fileSystem === null) {
                return;
            }
            var item = fileSystem.getItemWithPathDescription(bookmark.pathDescription);
            if (item.isFile()) {
                return this.goFile(item, true);
            }
            else {
                return this.goDirectory(item);
            }
        };
        Actions.prototype.viewRefresh = function () {
            var view = this.getFocusedView();
            if (view != null) {
                return view.refreshDirectory();
            }
        };
        Actions.prototype.viewMirror = function () {
            return __guard__(this.main.getMainView(), function (x) { return x.mirror(); });
        };
        Actions.prototype.viewSwap = function () {
            return __guard__(this.main.getMainView(), function (x) { return x.swap(); });
        };
        Actions.prototype.compareFolders = function () {
            var itemView;
            this.main.getMainView().hideMenuBar();
            var leftView = __guard__(this.main.getMainView(), function (x) { return x.getLeftView(); });
            var rightView = __guard__(this.main.getMainView(), function (x1) { return x1.getRightView(); });
            if ((leftView == null) || (rightView == null)) {
                return;
            }
            leftView.selectNone();
            rightView.selectNone();
            for (var _i = 0, _a = Array.from(leftView.itemViews); _i < _a.length; _i++) {
                itemView = _a[_i];
                if (rightView.getItemViewWithName(itemView.getName()) === null) {
                    itemView.select(true);
                }
            }
            return (function () {
                var result = [];
                for (var _i = 0, _a = Array.from(rightView.itemViews); _i < _a.length; _i++) {
                    itemView = _a[_i];
                    if (leftView.getItemViewWithName(itemView.getName()) === null) {
                        result.push(itemView.select(true));
                    }
                    else {
                        result.push(undefined);
                    }
                }
                return result;
            })();
        };
        Actions.prototype.compareFiles = function () {
            this.main.getMainView().hideMenuBar();
            var leftView = __guard__(this.main.getMainView(), function (x) { return x.getLeftView(); });
            var rightView = __guard__(this.main.getMainView(), function (x1) { return x1.getRightView(); });
            if ((leftView == null) || (rightView == null)) {
                return;
            }
            var leftViewItem = leftView.getHighlightedItem();
            if (leftViewItem === null) {
                return;
            }
            var rightViewItem = rightView.getHighlightedItem();
            if (rightViewItem === null) {
                return;
            }
            if (!(leftViewItem.itemController instanceof FileController)) {
                return;
            }
            if (!(rightViewItem.itemController instanceof FileController)) {
                return;
            }
            // leftViewItem = Utils.getFirstFileViewItem(leftView.getSelectedItemViews(true));
            //
            // if (leftViewItem == null)
            //   return;
            //
            // rightViewItem = Utils.getFirstFileViewItem(rightView.getSelectedItemViews(true));
            //
            // if (rightViewItem == null)
            //   return;
            this.main.getMainView().hideMenuBar();
            var leftFile = leftViewItem.itemController.getFile();
            var rightFile = rightViewItem.itemController.getFile();
            var title = "Diff: " + leftFile.getBaseName() + " | " + rightFile.getBaseName();
            var tooltip = leftFile.getPath() + " | " + rightFile.getPath();
            return Utils.compareFiles(title, tooltip, leftFile, rightFile);
        };
        Actions.prototype.bookmarksAddEditor = function () {
            var editor = atom.workspace.getActiveTextEditor();
            if (editor instanceof TextEditor) {
                if (editor.getPath() != null) {
                    return this.bookmarksAddLocalFilePath(editor.getPath());
                }
            }
        };
        Actions.prototype.bookmarksAddLocalFilePath = function (path) {
            var file = this.main.getLocalFileSystem().getFile(path);
            // If the file is being watched then add a remote bookmark instead.
            var serverManager = this.main.getServerManager();
            var watcher = serverManager.getWatcherWithLocalFilePath(path);
            if (watcher !== null) {
                file = watcher.getFile();
            }
            var dialog = new AddBookmarkDialog(this.main, file.getBaseName(), file, false);
            return dialog.attach();
        };
        Actions.prototype.bookmarksAdd = function (fromView) {
            if (fromView == null) {
                fromView = true;
            }
            var view = this.getFocusedView();
            if ((view == null)) {
                return;
            }
            var itemView = view.getHighlightedItem();
            if ((itemView == null)) {
                return;
            }
            var item = itemView.getItem();
            if (!itemView.isSelectable()) {
                item = view.directory;
            }
            __guard__(this.main.getMainView(), function (x) { return x.hideMenuBar(); });
            var dialog = new AddBookmarkDialog(this.main, item.getBaseName(), item, fromView);
            return dialog.attach();
        };
        Actions.prototype.bookmarksRemove = function (fromView) {
            var view;
            if (fromView == null) {
                fromView = true;
            }
            __guard__(this.main.getMainView(), function (x) { return x.hideMenuBar(); });
            return view = new BookmarksView(this, false, fromView);
        };
        Actions.prototype.bookmarksOpen = function (fromView) {
            var view;
            if (fromView == null) {
                fromView = true;
            }
            __guard__(this.main.getMainView(), function (x) { return x.hideMenuBar(); });
            return view = new BookmarksView(this, true, fromView);
        };
        Actions.prototype.serversAdd = function (fromView) {
            if (fromView == null) {
                fromView = true;
            }
            var view = this.getFocusedView();
            if ((view == null)) {
                return;
            }
            __guard__(this.main.getMainView(), function (x) { return x.hideMenuBar(); });
            var dialog = new NewServerDialog(view);
            return dialog.attach();
        };
        Actions.prototype.serversRemove = function (fromView) {
            var view;
            if (fromView == null) {
                fromView = true;
            }
            __guard__(this.main.getMainView(), function (x) { return x.hideMenuBar(); });
            return view = new ServersView(this, "remove", fromView);
        };
        Actions.prototype.serversOpen = function (fromView) {
            var view;
            if (fromView == null) {
                fromView = true;
            }
            __guard__(this.main.getMainView(), function (x) { return x.hideMenuBar(); });
            return view = new ServersView(this, "open", fromView);
        };
        Actions.prototype.serversClose = function (fromView) {
            var view;
            if (fromView == null) {
                fromView = true;
            }
            __guard__(this.main.getMainView(), function (x) { return x.hideMenuBar(); });
            return view = new ServersView(this, "close", fromView);
        };
        Actions.prototype.serversCache = function (fromView) {
            var view;
            if (fromView == null) {
                fromView = true;
            }
            __guard__(this.main.getMainView(), function (x) { return x.hideMenuBar(); });
            return view = new ServersView(this, "cache", fromView);
        };
        Actions.prototype.serversEdit = function (fromView) {
            var view;
            if (fromView == null) {
                fromView = true;
            }
            __guard__(this.main.getMainView(), function (x) { return x.hideMenuBar(); });
            return view = new ServersView(this, "edit", fromView);
        };
        Actions.prototype.uploadFile = function () {
            var editor = atom.workspace.getActiveTextEditor();
            if (!(editor instanceof TextEditor)) {
                return;
            }
            if ((editor.getPath() == null)) {
                return;
            }
            var serverManager = this.main.getServerManager();
            var watcher = serverManager.getWatcherWithLocalFilePath(editor.getPath());
            if (watcher === null) {
                atom.notifications.addInfo(editor.getPath() + " doesn't have a server associated with it.");
                return;
            }
            editor.save();
            // Only upload if saving will not automatically cause it to be uploaded.
            if (!atom.config.get("atom-commander.uploadOnSave")) {
                return watcher.upload();
            }
        };
        Actions.prototype.downloadFile = function () {
            var editor = atom.workspace.getActiveTextEditor();
            if (!(editor instanceof TextEditor)) {
                return;
            }
            if ((editor.getPath() == null)) {
                return;
            }
            var serverManager = this.main.getServerManager();
            var watcher = serverManager.getWatcherWithLocalFilePath(editor.getPath());
            if (watcher === null) {
                atom.notifications.addInfo(editor.getPath() + " doesn't have a server associated with it.");
                return;
            }
            var response = atom.confirm({
                message: "Download",
                detailedMessage: "Replace the cached file with the remote one?",
                buttons: ["No", "Yes"]
            });
            if (response === 0) {
                return;
            }
            var file = watcher.getFile();
            return file.download(editor.getPath(), function (err) {
                if (err != null) {
                    return Utils.showErrorWarning("Download failed", "Error downloading " + file.getURI(), null, err, true);
                }
                else {
                    return atom.notifications.addSuccess("Downloaded " + file.getURI());
                }
            });
        };
        Actions.prototype.compareWithServer = function () {
            var editor = atom.workspace.getActiveTextEditor();
            if (!(editor instanceof TextEditor)) {
                return;
            }
            if ((editor.getPath() == null)) {
                return;
            }
            var serverManager = this.main.getServerManager();
            var watcher = serverManager.getWatcherWithLocalFilePath(editor.getPath());
            if (watcher === null) {
                atom.notifications.addInfo(editor.getPath() + " doesn't have a server associated with it.");
                return;
            }
            var title = "Diff: " + editor.getTitle() + " | server";
            var tooltip = watcher.getFile().getPath();
            return Utils.compareFiles(title, tooltip, editor.getText(), watcher.getFile());
        };
        Actions.prototype.openTerminal = function () {
            var command;
            __guard__(this.main.getMainView(), function (x) { return x.hideMenuBar(); });
            var view = this.getFocusedView();
            if ((view == null)) {
                return;
            }
            var directory = view.directory;
            var folder = directory.getPath();
            if (directory.isRemote()) {
                folder = view.getLastLocalPath();
            }
            if (process.platform === "darwin") {
                command = "open -a Terminal";
                command += " \"" + folder + "\"";
            }
            else if (process.platform === "win32") {
                command = "start C:\\Windows\\System32\\cmd.exe";
                command += " \"" + folder + "\"";
            }
            else {
                command = "/usr/bin/x-terminal-emulator";
            }
            var options = {};
            options.cwd = folder;
            return ChildProcess.exec(command, options);
        };
        Actions.prototype.openFileSystem = function () {
            return this.openNative(true);
        };
        Actions.prototype.openSystem = function () {
            return this.openNative(false);
        };
        Actions.prototype.openNative = function (onlyShow) {
            var view = this.getFocusedView();
            if ((view == null)) {
                return;
            }
            var directory = view.directory;
            if (directory.isRemote()) {
                atom.notifications.addWarning("This operation is only applicable to the local file system.");
                return;
            }
            var itemView = view.getHighlightedItem();
            if (itemView === null) {
                return;
            }
            __guard__(this.main.getMainView(), function (x) { return x.hideMenuBar(); });
            if (!itemView.isSelectable()) {
                shell.showItemInFolder(directory.getPath());
                return;
            }
            var item = itemView.getItem();
            if (onlyShow) {
                shell.showItemInFolder(item.getPath());
                return;
            }
            if (item.isFile()) {
                return shell.openItem(item.getPath());
            }
            else {
                return shell.showItemInFolder(item.getPath());
            }
        };
        Actions.prototype.toggleSizeColumn = function () {
            return __guard__(this.main.getMainView(), function (x) { return x.toggleSizeColumn(); });
        };
        Actions.prototype.toggleDateColumn = function () {
            return __guard__(this.main.getMainView(), function (x) { return x.toggleDateColumn(); });
        };
        Actions.prototype.toggleExtensionColumn = function () {
            return __guard__(this.main.getMainView(), function (x) { return x.toggleExtensionColumn(); });
        };
        Actions.prototype.sortByName = function () {
            return __guard__(this.main.getMainView(), function (x) { return x.setSortBy('name'); });
        };
        Actions.prototype.sortByExtension = function () {
            return __guard__(this.main.getMainView(), function (x) { return x.setSortBy('extension'); });
        };
        Actions.prototype.sortBySize = function () {
            return __guard__(this.main.getMainView(), function (x) { return x.setSortBy('size'); });
        };
        Actions.prototype.sortByDate = function () {
            return __guard__(this.main.getMainView(), function (x) { return x.setSortBy('date'); });
        };
        Actions.prototype.sortByDefault = function () {
            return __guard__(this.main.getMainView(), function (x) { return x.setSortBy(null); });
        };
        return Actions;
    }()));
function __guard__(value, transform) {
    return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}
//# sourceMappingURL=actions.js.map