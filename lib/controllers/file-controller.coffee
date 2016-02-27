ItemController = require './item-controller'

module.exports =
class FileController extends ItemController

  constructor: (file) ->
    super(file);

  getFile: ->
    return @item;

  getName: ->
    if !@name?
      @refreshNameExtension();
    return @name;

  getExtension: ->
    if !@extension?
      @refreshNameExtension();
    return @extension;

  refreshNameExtension: ->
    ne = @getNameExtension();
    @name = ne[0];
    @extension = ne[1];

  performOpenAction: ->
    @getFile().open();
