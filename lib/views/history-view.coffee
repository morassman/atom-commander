{$, View} = require 'atom-space-pen-views'

module.exports =
class HistoryView extends View

  constructor: ->
    super();

  @content: ->
    @div {class: "history-panel popover-list select-list"}, =>
      @ol {id: "itemList", class: "history-list list-group", style: "margin: 0", outlet: "itemList"}

  initialize: ->
    @hide();
    @clickHandler = (e) =>
      if (e.target.id != 'itemList') and !@itemList.find(e.target).length
        @close();

    @on 'mousedown', '.list-item', (e) =>
      @hide();
      @containerView.setDirectory(e.target.textContent);

    @itemList.append($("<li class='history-list-item list-item'>/Users/henkmarais/github</li>"));

  toggle: ->
    if @isVisible()
      @close();
    else
      @open();

  isVisible: ->
    @.is(":visible")

  open: ->
    # @itemList.empty();
    @show();
    @itemList.focus();
    $(document).on 'click', @clickHandler

  close: ->
    @hide();
    $(document).off 'click', @clickHandler

  setContainerView: (@containerView) ->
    if @containerView.isLeft()
      @addClass("left-history-panel");
    else
      @addClass("right-history-panel");

  refreshItems: ->
