ListView = require './views/list-view'
AtomCommanderView = require './atom-commander-view'
{CompositeDisposable, Directory} = require 'atom'

module.exports = AtomCommander =
  # atomCommanderView: null
  bottomPanel: null
  subscriptions: null

  activate: (state) ->
    @atomCommanderView = new AtomCommanderView(@)
    # @modalPanel = atom.workspace.addModalPanel(item: @atomCommanderView.getElement(), visible: false)
    # @listView = new ListView();
    @bottomPanel = atom.workspace.addBottomPanel(item: @atomCommanderView.getElement(), visible: false)

    # Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    @subscriptions = new CompositeDisposable

    # Register command that toggles this view
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:toggle': => @toggle()

  deactivate: ->
    @bottomPanel.destroy()
    @subscriptions.dispose()
    @atomCommanderView.destroy()

  serialize: ->
    atomCommanderViewState: @atomCommanderView.serialize()

  toggle: ->
    if @bottomPanel.isVisible()
      @bottomPanel.hide()
    else
      @bottomPanel.show()

  hide: ->
    @bottomPanel.hide();
