ItemController = require './item-controller'

module.exports =
class DirectoryController extends ItemController

  constructor: (directory) ->
    super(directory);

  getDirectory: ->
    return @item;

  getName: ->
    return @item.getBaseName();

  performOpenAction: ->
    console.log("Open directory.");
    @getContainerView().openDirectory(@getDirectory());
