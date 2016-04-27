module.exports =
class BaseItemView extends HTMLElement

  constructor: ->
    super();
    @selected = false;
    @highlighted = false;
    @focused = false;
    @itemName = '';

  initialize: (@containerView, @itemController) ->
    @itemController.initialize(@);
    @.classList.add('item');
    @itemName = @getName();

  getContainerView: ->
    return @containerView;

  getItemController: ->
    return @itemController;

  getItem: ->
    return @itemController.getItem();

  # Called if anything about the item changed.
  refresh: ->

  # Override to return the name of this item.
  getName: ->

  # Override to return the path of this item.
  getPath: ->

  # Override to return whether this item is selectable.
  isSelectable: ->

  setSizeColumnVisible: (visible) ->

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
