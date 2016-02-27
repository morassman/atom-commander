ItemController = require './item-controller'

module.exports =
class FileController extends ItemController

  constructor: (file) ->
    super(file);

  getFile: ->
    return @item;

  getNamePart: ->
    if !@namePart?
      @refreshNameExtension();
    return @namePart;

  getExtensionPart: ->
    if !@extensionPart?
      @refreshNameExtension();
    return @extensionPart;

  refreshNameExtension: ->
    ne = @getNameExtension();
    @namePart = ne[0];
    @extensionPart = ne[1];

  performOpenAction: ->
    @getFile().open();
