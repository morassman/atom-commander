ItemController = require './item-controller'
FileController = require './file-controller'
DirectoryController = require './directory-controller'

module.exports =
class SymLinkController extends ItemController

  constructor: (symLink) ->
    super(symLink);
    @targetController = null;

  getNamePart: ->
    if @namePart?
      return @namePart;
    return super();

  getExtensionPart: ->
    if @extensionPart?
      return @extensionPart;
    return super();

  getTargetController: ->
    return @targetController;

  getTargetItem: ->
    return @item.getTargetItem();

  refresh: ->
    @refreshTargetController();
    super();

  refreshTargetController: ->
    targetItem = @getTargetItem();

    if !targetItem?
      return;

    if targetItem.isFile()
      @targetController = new FileController(targetItem);
      ne = @getNameExtension();
      @namePart = ne[0];
      @extensionPart = ne[1];
    else if targetItem.isDirectory()
      @targetController = new DirectoryController(targetItem);
      @namePart = @item.getBaseName();
      @extensionPart = null;
    else
      @namePart = null;
      @extensionPart = null;

    @targetController?.initialize(@getItemView());

  performOpenAction: ->
    @targetController?.performOpenAction();
