FileController = require './controllers/file-controller'

module.exports =
class Actions

  @getFirstFileViewItem: (viewItems) ->
    if viewItems == null
      return null;

    for viewItem in viewItems
      if viewItem.itemController instanceof FileController
        return viewItem;

    return null;

  @sortItems: (items) ->
    items.sort (item1, item2) ->
      name1 = item1.getBaseName();
      name2 = item2.getBaseName();

      if name1 < name2
        return -1;
      else if name1 > name2
        return 1;

      return 0;
