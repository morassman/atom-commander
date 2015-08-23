ItemController = require './item-controller'

module.exports =
class FileController extends ItemController

  constructor: (file) ->
    super(file);

  getFile: ->
    return @item;

  getName: ->
    return @item.getBaseName();

  getPath: ->
    return @item.getRealPathSync();

  canRename: ->
    return true;

  getNameExtension: ->
    baseName = @item.getBaseName();

    index = baseName.lastIndexOf(".");
    lastIndex = baseName.length - 1;

    if (index == -1) or (index == 0) or (index == lastIndex)
      return [baseName, ''];

    return [baseName.slice(0, index), baseName.slice(index + 1)];

  performOpenAction: ->
    atom.workspace.open(@getFile().getPath());
