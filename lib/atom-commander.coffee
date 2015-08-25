Actions = require './actions'
ListView = require './views/list-view'
DiffView = require './views/diff/diff-view'
AtomCommanderView = require './atom-commander-view'
{CompositeDisposable, File, Directory} = require 'atom'

module.exports = AtomCommander =
  mainView: null
  bottomPanel: null
  subscriptions: null

  activate: (@state) ->
    @actions = new Actions(@);
    @mainView = new AtomCommanderView(@, @state);
    @bottomPanel = atom.workspace.addBottomPanel(item: @mainView.getElement(), visible: false)

    # Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    @subscriptions = new CompositeDisposable

    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:toggle-visible': => @toggleVisible();
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:toggle-focus': => @toggleFocus();
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:select-all': => @actions.selectAll();
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:select-none': => @actions.selectNone();
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:select-invert': => @actions.selectInvert();
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:select-folders': => @actions.selectFolders();
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:select-files': => @actions.selectFiles();
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:compare-folders': => @actions.compareFolders();
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:compare-files': => @actions.compareFiles();

    @openTestDiff();

    if state.visible
      @show();

  openTestDiff: ->
    # console.log("openTestDiff");

    # leftFile = new File("/Users/henkmarais/Temp/left.txt");
    # rightFile = new File("/Users/henkmarais/Temp/right.txt");
    #
    # view = new DiffView(leftFile, rightFile);
    # pane = atom.workspace.getActivePane();
    # item = pane.addItem view, 0
    # pane.activateItem item

  deactivate: ->
    @bottomPanel.destroy()
    @subscriptions.dispose()
    @mainView.destroy()

  serialize: ->
    if @mainView != null
      state = @mainView.serialize();
      state.visible = @bottomPanel.isVisible();
      return state;

    return @state;

  toggleVisible: ->
    if @bottomPanel.isVisible()
      @hide()
    else
      @show();

  toggleFocus: ->
    if @bottomPanel.isVisible()
      if (@mainView.focusedView != null) and @mainView.focusedView.hasFocus()
        @mainView.focusedView.unfocus();
      else
        @mainView.refocusLastView();
    else
      @show();

  show: ->
    @bottomPanel.show()
    @mainView.refocusLastView();

  hide: ->
    @mainView.focusedView.unfocus();
    @bottomPanel.hide();
