VItem = require './vitem'

module.exports =
class VSymLink extends VItem

  constructor: (fileSystem) ->
    super(fileSystem);
    @targetItem = null;

  setTargetItem: (@targetItem) ->
    if @controller?
      @controller.refresh();

  getTargetItem: ->
    return @targetItem;

  isFile: ->
    if !@targetItem?
      return false;

    return @targetItem.isFile();

  isDirectory: ->
    if !@targetItem?
      return false;

    return @targetItem.isDirectory();

  existsSync: ->
    return true;

  isLink: ->
    return true;

  setModifyDate: (@modifyDate) ->
    @controller?.refresh();

  setSize: (@size) ->
    @controller?.refresh();
  
# This is called once it is known that the symlink points to file.
  setTargetFilePath: (targetPath) ->
    @setTargetItem(@createFileItem(targetPath));

# This is called once it is known that the symlink points to directory.
  setTargetDirectoryPath: (targetPath) ->
    @setTargetItem(@createDirectoryItem(targetPath));

# Overwrite to create a VFile for the file pointed to by this symlink.
  createFileItem: (targetPath) ->

# Overwrite to create a VDirectory for the directory pointed to by this symlink.
  createDirectoryItem: (targetPath) ->
