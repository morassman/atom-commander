/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var BookmarkManager;
var fsp = require('fs-plus');
module.exports =
    (BookmarkManager = /** @class */ (function () {
        function BookmarkManager(main, state) {
            this.main = main;
            this.bookmarks = [];
            this.contextMenuDisposable = null;
            this.commandsDisposable = null;
            if (state != null) {
                for (var _i = 0, _a = Array.from(state); _i < _a.length; _i++) {
                    var bookmark = _a[_i];
                    if (bookmark instanceof Array) {
                        bookmark = this.convertArrayBookmarkToObject(bookmark);
                    }
                    this.bookmarks.push(bookmark);
                }
            }
            this.bookmarksChanged();
        }
        BookmarkManager.prototype.convertArrayBookmarkToObject = function (bookmark) {
            var item;
            var result = {};
            result.name = bookmark[0];
            var localFileSystem = this.main.getLocalFileSystem();
            if (fsp.isFileSync(bookmark[1])) {
                item = localFileSystem.getFile(bookmark[1]);
            }
            else {
                item = localFileSystem.getDirectory(bookmark[1]);
            }
            result.pathDescription = item.getPathDescription();
            return result;
        };
        BookmarkManager.prototype.addBookmark = function (name, item) {
            var bookmark = {};
            bookmark.name = name;
            bookmark.pathDescription = item.getPathDescription();
            this.bookmarks.push(bookmark);
            this.main.saveState();
            return this.bookmarksChanged();
        };
        // Adds multiple bookmarks.
        // bookmarks : Array of bookmarks to add.
        BookmarkManager.prototype.addBookmarks = function (bookmarks) {
            for (var _i = 0, _a = Array.from(bookmarks); _i < _a.length; _i++) {
                var bookmark = _a[_i];
                this.bookmarks.push(bookmark);
            }
            this.main.saveState();
            return this.bookmarksChanged();
        };
        BookmarkManager.prototype.removeBookmark = function (bookmark, save) {
            if (save == null) {
                save = true;
            }
            var index = this.bookmarks.indexOf(bookmark);
            if (index >= 0) {
                this.bookmarks.splice(index, 1);
                this.bookmarksChanged();
            }
            if (save) {
                return this.main.saveState();
            }
        };
        BookmarkManager.prototype.getBookmarksWithFileSystemId = function (fileSystemId) {
            var result = [];
            for (var _i = 0, _a = Array.from(this.bookmarks); _i < _a.length; _i++) {
                var bookmark = _a[_i];
                if (bookmark.pathDescription.fileSystemId === fileSystemId) {
                    result.push(bookmark);
                }
            }
            return result;
        };
        BookmarkManager.prototype.fileSystemRemoved = function (fileSystem) {
            var bs = this.getBookmarksWithFileSystemId(fileSystem.getID());
            if (bs.length === 0) {
                return;
            }
            for (var _i = 0, _a = Array.from(bs); _i < _a.length; _i++) {
                var b = _a[_i];
                this.removeBookmark(b, false);
            }
            return this.main.saveState();
        };
        BookmarkManager.prototype.bookmarksChanged = function () {
            var _this = this;
            var commands = {};
            var menuItems = [];
            var index = 0;
            for (var _i = 0, _a = Array.from(this.bookmarks); _i < _a.length; _i++) {
                var bookmark = _a[_i];
                index++;
                (function (index, bookmark) {
                    var commandName = 'atom-commander:bookmark-' + index;
                    commands[commandName] = function () { return _this.openBookmark(bookmark); };
                    return menuItems.push({
                        label: bookmark.name,
                        command: commandName
                    });
                })(index, bookmark);
            }
            if (index > 0) {
                menuItems.push({ type: 'separator' });
            }
            menuItems.push({ label: 'Add', command: 'atom-commander:add-bookmark' });
            menuItems.push({ label: 'Remove', command: 'atom-commander:remove-bookmark' });
            menuItems.push({ label: 'Open', command: 'atom-commander:open-bookmark' });
            if (this.contextMenuDisposable != null) {
                this.contextMenuDisposable.dispose();
            }
            if (this.commandsDisposable != null) {
                this.commandsDisposable.dispose();
            }
            this.contextMenuDisposable = atom.contextMenu.add({
                '.atom-commander': [{
                        label: 'Bookmarks',
                        submenu: menuItems
                    }]
            });
            return this.commandsDisposable = atom.commands.add('atom-workspace', commands);
        };
        BookmarkManager.prototype.openBookmark = function (bookmark) {
            return this.main.actions.goBookmark(bookmark);
        };
        BookmarkManager.prototype.serialize = function () {
            return this.bookmarks;
        };
        return BookmarkManager;
    }()));
//# sourceMappingURL=bookmark-manager.js.map