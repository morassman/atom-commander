FSItem = require './model/fs-item'
ListView = require './views/list-view'
AtomCommanderView = require './atom-commander-view'
{CompositeDisposable, Directory} = require 'atom'

module.exports = AtomCommander =
  # atomCommanderView: null
  modalPanel: null
  subscriptions: null

  activate: (state) ->
    @atomCommanderView = new AtomCommanderView()
    # @modalPanel = atom.workspace.addModalPanel(item: @atomCommanderView.getElement(), visible: false)
    # @listView = new ListView();
    @modalPanel = atom.workspace.addBottomPanel(item: @atomCommanderView.getElement(), visible: true)

    # Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    @subscriptions = new CompositeDisposable

    # Register command that toggles this view
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:toggle': => @toggle()

    # root = new Directory("/");
    # entries = root.getEntriesSync();
    # fsItems = [];
    #
    # for entry in entries
    #   fsItems.push(new FSItem(entry));
    #
    # @listView.setItems(fsItems);

  deactivate: ->
    @modalPanel.destroy()
    @subscriptions.dispose()
    @atomCommanderView.destroy()

  serialize: ->
    atomCommanderViewState: @atomCommanderView.serialize()

  toggle: ->
    console.log 'AtomCommander was toggled!'

    if @modalPanel.isVisible()
      @modalPanel.hide()
    else
      @modalPanel.show()
