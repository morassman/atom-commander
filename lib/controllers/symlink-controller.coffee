ItemController = require './item-controller'
FileController = require './file-controller'
DirectoryController = require './directory-controller'

module.exports =
class SymLinkController extends ItemController

  constructor: (symLink) ->
    super(symLink);
    @targetController = null;

  getName: ->
    if @name?
      return @name;
    return super();

  getExtension: ->
    if @extension?
      return @extension;
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
      @name = ne[0];
      @extension = ne[1];
    else if targetItem.isDirectory()
      @targetController = new DirectoryController(targetItem);
      @name = @item.getBaseName();
      @extension = null;
    else
      @name = null;
      @extension = null;

    @targetController?.initialize(@getItemView());

  performOpenAction: ->
    @targetController?.performOpenAction();
