fsp = require 'fs-plus'

module.exports =
class BookmarkManager

  constructor: (@main, state) ->
    @bookmarks = [];

    if state?
      for bookmark in state
        if bookmark instanceof Array
          bookmark = @convertArrayBookmarkToObject(bookmark);
        @bookmarks.push(bookmark);

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

  removeBookmark: (bookmark, save=true) ->
    index = @bookmarks.indexOf(bookmark);

    if (index >= 0)
      @bookmarks.splice(index, 1);

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

  serialize: ->
    return @bookmarks;
