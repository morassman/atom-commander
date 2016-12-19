fsp = require 'fs-plus'

module.exports =
class BookmarkManager

  constructor: (@main, state) ->
    @bookmarks = [];
    @contextMenuDisposable = null;
    @commandsDisposable = null;

    if state?
      for bookmark in state
        if bookmark instanceof Array
          bookmark = @convertArrayBookmarkToObject(bookmark);
        @bookmarks.push(bookmark);

    @bookmarksChanged();

  convertArrayBookmarkToObject: (bookmark) ->
    result = {};
    result.name = bookmark[0];
    localFileSystem = @main.getLocalFileSystem();

    if fsp.isFileSync(bookmark[1])
      item = localFileSystem.getFile(bookmark[1]);
    else
      item = localFileSystem.getDirectory(bookmark[1]);

    result.pathDescription = item.getPathDescription();

    return result;

  addBookmark: (name, item) ->
    bookmark = {};
    bookmark.name = name;
    bookmark.pathDescription = item.getPathDescription();

    @bookmarks.push(bookmark);
    @main.saveState();
    @bookmarksChanged();

  # Adds multiple bookmarks.
  # bookmarks : Array of bookmarks to add.
  addBookmarks: (bookmarks) ->
    for bookmark in bookmarks
      @bookmarks.push(bookmark);

    @main.saveState();
    @bookmarksChanged();

  removeBookmark: (bookmark, save=true) ->
    index = @bookmarks.indexOf(bookmark);

    if (index >= 0)
      @bookmarks.splice(index, 1);
      @bookmarksChanged();

    if save
      @main.saveState();

  getBookmarksWithFileSystemId: (fileSystemId) ->
    result = [];

    for bookmark in @bookmarks
      if bookmark.pathDescription.fileSystemId == fileSystemId
        result.push(bookmark);

    return result;

  fileSystemRemoved: (fileSystem) ->
    bs = @getBookmarksWithFileSystemId(fileSystem.getID());

    if bs.length == 0
      return;

    for b in bs
      @removeBookmark(b, false);

    @main.saveState();

  bookmarksChanged: ->
    commands = {};
    menuItems = [];
    index = 0;

    for bookmark in @bookmarks
      index++;
      do (index, bookmark) =>
        commandName = 'atom-commander:bookmark-' + index;
        commands[commandName] = () => @openBookmark(bookmark)
        menuItems.push {
          label: bookmark.name,
          command: commandName
        }

    if index > 0
      menuItems.push { type: 'separator' }

    menuItems.push { label: 'Add', command: 'atom-commander:add-bookmark' }
    menuItems.push { label: 'Remove', command: 'atom-commander:remove-bookmark' }
    menuItems.push { label: 'Open', command: 'atom-commander:open-bookmark' }

    if @contextMenuDisposable?
      @contextMenuDisposable.dispose();

    if @commandsDisposable?
      @commandsDisposable.dispose();

    @contextMenuDisposable = atom.contextMenu.add {
      '.atom-commander': [{
        label: 'Bookmarks'
        submenu: menuItems
      }]
    }

    @commandsDisposable = atom.commands.add('atom-workspace', commands);

  openBookmark: (bookmark) ->
    @main.actions.goBookmark(bookmark);

  serialize: ->
    return @bookmarks;
