module.exports =
class BaseItemView extends HTMLElement

  constructor: ->
    super();

  initialize: (@containerView, @itemController) ->
    @itemController.initialize(@);
    @.classList.add('item');

  getContainerView: ->
    return @containerView;

  getItemController: ->
    return @itemController;

  # Override to return the name of this item.
  getName: ->

  highlight: (enable) ->
    if enable
      @.classList.add('highlighted');
    else
      @.classList.remove('highlighted');

  performOpenAction: ->
    @itemController.performOpenAction();
