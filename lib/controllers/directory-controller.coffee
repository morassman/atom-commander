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
    @getContainerView().openDirectory(@getDirectory());
