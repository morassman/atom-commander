module.exports =
class Actions

  constructor: (@main) ->

  getFocusedView: ->
    return @main.mainView.focusedView;

  selectAll: =>
    view = @getFocusedView();
    view?.selectAll();

  selectNone: =>
    view = @getFocusedView();
    view?.selectNone();

  selectInvert: =>
    view = @getFocusedView();
    view?.selectInvert();

  compareFolders: =>
    leftView = @main.mainView.leftView;
    rightView = @main.mainView.rightView;

    leftView.selectNone();
    rightView.selectNone();

    for itemView in leftView.itemViews
      if rightView.getItemViewWithName(itemView.getName()) == null
        itemView.select(true);

    for itemView in rightView.itemViews
      if leftView.getItemViewWithName(itemView.getName()) == null
        itemView.select(true);
