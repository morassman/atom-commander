ItemController = require './item-controller'

module.exports =
class FileController extends ItemController

  constructor: (file) ->
    super(file);

  getFile: ->
    return @item;

  getName: ->
    return @item.getBaseName();

  performOpenAction: ->
    console.log("Open file.");
    atom.workspace.open(@getFile().getPath());
