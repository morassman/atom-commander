/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let BookmarkManager;
const fsp = require('fs-plus');

module.exports =
(BookmarkManager = class BookmarkManager {

  constructor(main, state) {
    this.main = main;
    this.bookmarks = [];
    this.contextMenuDisposable = null;
    this.commandsDisposable = null;

    if (state != null) {
      for (let bookmark of Array.from(state)) {
        if (bookmark instanceof Array) {
          bookmark = this.convertArrayBookmarkToObject(bookmark);
        }
        this.bookmarks.push(bookmark);
      }
    }

    this.bookmarksChanged();
  }

  convertArrayBookmarkToObject(bookmark) {
    let item;
    const result = {};
    result.name = bookmark[0];
    const localFileSystem = this.main.getLocalFileSystem();

    if (fsp.isFileSync(bookmark[1])) {
      item = localFileSystem.getFile(bookmark[1]);
    } else {
      item = localFileSystem.getDirectory(bookmark[1]);
    }

    result.pathDescription = item.getPathDescription();

    return result;
  }

  addBookmark(name, item) {
    const bookmark = {};
    bookmark.name = name;
    bookmark.pathDescription = item.getPathDescription();

    this.bookmarks.push(bookmark);
    this.main.saveState();
    return this.bookmarksChanged();
  }

  // Adds multiple bookmarks.
  // bookmarks : Array of bookmarks to add.
  addBookmarks(bookmarks) {
    for (let bookmark of Array.from(bookmarks)) {
      this.bookmarks.push(bookmark);
    }

    this.main.saveState();
    return this.bookmarksChanged();
  }

  removeBookmark(bookmark, save) {
    if (save == null) { save = true; }
    const index = this.bookmarks.indexOf(bookmark);

    if (index >= 0) {
      this.bookmarks.splice(index, 1);
      this.bookmarksChanged();
    }

    if (save) {
      return this.main.saveState();
    }
  }

  getBookmarksWithFileSystemId(fileSystemId) {
    const result = [];

    for (let bookmark of Array.from(this.bookmarks)) {
      if (bookmark.pathDescription.fileSystemId === fileSystemId) {
        result.push(bookmark);
      }
    }

    return result;
  }

  fileSystemRemoved(fileSystem) {
    const bs = this.getBookmarksWithFileSystemId(fileSystem.getID());

    if (bs.length === 0) {
      return;
    }

    for (let b of Array.from(bs)) {
      this.removeBookmark(b, false);
    }

    return this.main.saveState();
  }

  bookmarksChanged() {
    const commands = {};
    const menuItems = [];
    let index = 0;

    for (let bookmark of Array.from(this.bookmarks)) {
      index++;
      ((index, bookmark) => {
        const commandName = 'atom-commander:bookmark-' + index;
        commands[commandName] = () => this.openBookmark(bookmark);
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
  }

  openBookmark(bookmark) {
    return this.main.actions.goBookmark(bookmark);
  }

  serialize() {
    return this.bookmarks;
  }
});
