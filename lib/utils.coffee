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
