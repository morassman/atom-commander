module.exports =
class BaseItemView extends HTMLElement

  constructor: ->
    super();
    @selected = false;
    @highlighted = false;
    @focused = false;

  initialize: (@containerView, @itemController) ->
    @itemController.initialize(@);
    @.classList.add('item');

  getContainerView: ->
    return @containerView;

  getItemController: ->
    return @itemController;

  # Override to return the name of this item.
  getName: ->

  # Override to return the path of this item.
  getPath: ->

  # Override to return whether this item is selectable.
  isSelectable: ->

  canRename: ->
    return @itemController.canRename();

  highlight: (@highlighted, @focused) ->
    @refreshClassList();

  toggleSelect: ->
    @select(!@selected);

  select: (selected) ->
    if @isSelectable()
      @selected = selected;
      @refreshClassList();

  refreshClassList: ->
    @.classList.remove('selected');
    @.classList.remove('highlighted-focused');
    @.classList.remove('highlighted-unfocused');

    if @highlighted
      if @focused
        @.classList.add('highlighted-focused');
      else
        @.classList.add('highlighted-unfocused');

    if @selected
      @.classList.add('selected');

  performOpenAction: ->
    @itemController.performOpenAction();
