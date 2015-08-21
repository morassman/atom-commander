ListView = require './views/list-view'
AtomCommanderView = require './atom-commander-view'
{CompositeDisposable, Directory} = require 'atom'

module.exports = AtomCommander =
  atomCommanderView: null
  bottomPanel: null
  subscriptions: null

  activate: (@state) ->
    @atomCommanderView = new AtomCommanderView(@, @state);
    @bottomPanel = atom.workspace.addBottomPanel(item: @atomCommanderView.getElement(), visible: false)

    # Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    @subscriptions = new CompositeDisposable

    # Register command that toggles this view
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:toggle': => @toggle()

    if state.visible
      @show();

  deactivate: ->
    @bottomPanel.destroy()
    @subscriptions.dispose()
    @atomCommanderView.destroy()

  serialize: ->
    if @atomCommanderView != null
      state = @atomCommanderView.serialize();
      state.visible = @bottomPanel.isVisible();
      return state;

    return @state;

  toggle: ->
    if @bottomPanel.isVisible()
      @bottomPanel.hide()
    else
      @show();

  show: ->
    @bottomPanel.show()
    @atomCommanderView.refocusLastView();

  hide: ->
    @bottomPanel.hide();
