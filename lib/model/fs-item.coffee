{Directory, File} = require 'atom'

module.exports =
class FSItem

  # item : File or Directory
  constructor: (@item) ->

  # Sets the view that represents this item.
  setView: (@view) ->

  getName: ->
    return @item.getBaseName();

  isFile: ->
    return @item instanceof File;

  isDirectory: ->
    return @item instanceof Directory;

  getDirectory: ->
    if @isFile()
      return @item.getParent();

    return @item;
