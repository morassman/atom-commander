VItem = require './vitem'

module.exports =
class VSymLink extends VItem

  constructor: (fileSystem) ->
    super(fileSystem);
    @item = null;

  getItem: ->
    return @item;

  isFile: ->
    if !@item?
      return false;

    return @item.isFile();

  isDirectory: ->
    if !@item?
      return false;

    return @item.isDirectory();

  existsSync: ->
    return true;

  isLink: ->
    return true;
