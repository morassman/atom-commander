ItemController = require './item-controller'

module.exports =
class DirectoryController extends ItemController

  constructor: (directory) ->
    super(directory);

  getDirectory: ->
    return @item;

  performOpenAction: ->
    @getContainerView().openDirectory(@getDirectory());
