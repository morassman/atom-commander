Actions = require './actions'
Schemas = require './schemas'
ListView = require './views/list-view'
DiffView = require './views/diff/diff-view'
StatusView = require './views/status-view'
AtomCommanderView = require './atom-commander-view'
BookmarkManager = require './bookmark-manager'
ServerManager = require './servers/server-manager'
LocalFileSystem = require './fs/local/local-filesystem'
{CompositeDisposable, File, Directory} = require 'atom'

fsp = null;

ATOM_COMMANDER_URI = 'atom://atom-commander'

module.exports = AtomCommander =

  config:
    panel:
      type: "object"
      properties:
        hideOnOpen:
          title: "Hide On Open"
          description: "Hide the panel after opening a file."
          type: "boolean"
          default: false
        showInDock:
          title: "Show In Dock"
          description: "Show the panel in the dock. This allows docking on the left and right as well."
          type: "boolean"
          default: false
    uploadOnSave:
      title: "Upload Cached File On Save"
      description: "Automatically upload cached files when saved."
      type: "boolean"
      default: true
    removeOnClose:
      title: "Remove Cached File On Close"
      description: "Remove a cached file after it was closed and successfully uploaded."
      type: "boolean"
      default: true

  activate: (@state) ->
    @loadState();
    @bookmarks = [];

    @localFileSystem = new LocalFileSystem(@);
    @actions = new Actions(@);
    @bookmarkManager = new BookmarkManager(@, @state.bookmarks);
    @serverManager = new ServerManager(@, @state.servers);
    @mainView = new AtomCommanderView(@, @state);
    @element = @mainView.getElement();

    @subscriptions = new CompositeDisposable();

    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:toggle-visible': => @toggle();
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:toggle-focus': => @toggleFocus();

    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:select-all': => @actions.selectAll();
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:select-none': => @actions.selectNone();
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:select-add': => @actions.selectAdd();
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:select-remove': => @actions.selectRemove();
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:select-invert': => @actions.selectInvert();
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:select-folders': => @actions.selectFolders();
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:select-files': => @actions.selectFiles();

    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:refresh-view': => @actions.viewRefresh();
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:mirror-view': => @actions.viewMirror();
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:swap-view': => @actions.viewSwap();

    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:compare-folders': => @actions.compareFolders();
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:compare-files': => @actions.compareFiles();

    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:go-project': => @actions.goProject();
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:go-editor': => @actions.goEditor();
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:go-drive': => @actions.goDrive();
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:go-root': => @actions.goRoot();
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:go-home': => @actions.goHome();

    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:add-bookmark': => @actions.bookmarksAdd(false);
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:remove-bookmark': => @actions.bookmarksRemove(false);
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:open-bookmark': => @actions.bookmarksOpen(false);

    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:add-server': => @actions.serversAdd(false);
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:remove-server': => @actions.serversRemove(false);
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:open-server': => @actions.serversOpen(false);
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:close-server': => @actions.serversClose(false);
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:edit-server': => @actions.serversEdit(false);
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:open-cache': => @actions.serversCache(false);

    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:open-terminal': => @actions.openTerminal();
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:show-in-file-manager': => @actions.openFileSystem();
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:open-with-system': => @actions.openSystem();

    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:toggle-size-column': => @actions.toggleSizeColumn();
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:toggle-date-column': => @actions.toggleDateColumn();
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:toggle-extension-column': => @actions.toggleExtensionColumn();

    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:sort-by-name': => @actions.sortByName();
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:sort-by-extension': => @actions.sortByExtension();
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:sort-by-size': => @actions.sortBySize();
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:sort-by-date': => @actions.sortByDate();
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:sort-by-default': => @actions.sortByDefault();

    @subscriptions.add atom.commands.add 'atom-text-editor', 'atom-commander:upload-file': (event) =>
      event.stopPropagation();
      @actions.uploadFile();

    @subscriptions.add atom.commands.add 'atom-text-editor', 'atom-commander:download-file': (event) =>
      event.stopPropagation();
      @actions.downloadFile();

    @subscriptions.add atom.commands.add 'atom-text-editor', 'atom-commander:compare-with-server': (event) =>
      event.stopPropagation();
      @actions.compareWithServer();

    @subscriptions.add atom.commands.add 'atom-text-editor', 'atom-commander:add-bookmark': (event) =>
      event.stopPropagation();
      @actions.bookmarksAddEditor();

    # @subscriptions.add atom.workspace.getLeftDock().onDidAddPane (event) =>
    #   console.log('onDidAddPane');
    #   console.log(event);
    #
    # @subscriptions.add atom.workspace.getLeftDock().onDidAddPaneItem (event) =>
    #   console.log('onDidAddPaneItem');
    #   console.log(event);
    #
    # @subscriptions.add atom.workspace.getLeftDock().observePanes (event) =>
    #   console.log('observePanes');
    #   console.log(event);
    #
    # @subscriptions.add atom.workspace.getLeftDock().observePaneItems (event) =>
    #   console.log('observePaneItems');
    #   console.log(event);
    #
    # @subscriptions.add atom.workspace.getLeftDock().onDidChangeActivePane (event) =>
    #   console.log('onDidChangeActivePane');
    #   console.log(event);

    # Monitor active pane item in docks.
    @subscriptions.add atom.workspace.getLeftDock().onDidChangeActivePaneItem (event) =>
      @dockActivePaneItemChanged(event);

    @subscriptions.add atom.workspace.getRightDock().onDidChangeActivePaneItem (event) =>
      @dockActivePaneItemChanged(event);

    @subscriptions.add atom.workspace.getBottomDock().onDidChangeActivePaneItem (event) =>
      @dockActivePaneItemChanged(event);

    if !atom.config.get('atom-commander.panel.showInDock')
      @bottomPanel = atom.workspace.addBottomPanel(item: @mainView.getElement(), visible: false);

    if @state.visible
      @show(false);

  getTitle: ->
    return 'Atom Commander';

  getURI: ->
    return ATOM_COMMANDER_URI

  getPreferredLocation: ->
    return 'bottom';

  getAllowedLocations: ->
    return ['bottom', 'left', 'right'];

  isPermanentDockItem: ->
    return false;

  getActions: ->
    return @actions;

  getLocalFileSystem: ->
    return @localFileSystem;

  getBookmarkManager: ->
    return @bookmarkManager;

  getServerManager: ->
    return @serverManager;

  getSaveFile: ->
    configFile = new File(atom.config.getUserConfigPath());
    directory = configFile.getParent();
    return directory.getFile("atom-commander.json");

  loadState: ->
    if !@state?
      @state = Schemas.newState();

    file = @getSaveFile();

    if !file.existsSync()
      return;

    fsp ?= require 'fs-plus';

    try
      @state = JSON.parse(fsp.readFileSync(file.getPath()));
      @state = Schemas.upgrade(@state);
    catch error
      console.log("Error loading Atom Commander state.");
      console.log(error);

  saveState: ->
    fsp ?= require 'fs-plus';

    state = @serialize();
    file = @getSaveFile();
    state.version = 3;

    try
      fsp.writeFileSync(file.getPath(), JSON.stringify(state));
    catch error
      console.log("Error saving Atom Commander state.");
      console.log(error);

  deactivate: ->
    @saveState();
    @bottomPanel?.destroy();
    @subscriptions.dispose();
    @serverManager.dispose();
    @mainView.destroy();
    @statusTile?.destroy();

  serialize: ->
    if @mainView != null
      visible = @state.visible;
      state = @mainView.serialize();
      state.visible = visible;
      state.bookmarks = @bookmarkManager.serialize();
      state.servers = @serverManager.serialize();
      return state;

    return @state;

  dockActivePaneItemChanged: (item) ->
    if item != @
      return;

    dock = @getDock();

    if dock?
      @mainView.setHorizontal(dock.location == 'bottom');

  getDock: ->
    if atom.workspace.getBottomDock().getPaneItems().indexOf(@) >= 0
      return atom.workspace.getBottomDock();
    if atom.workspace.getLeftDock().getPaneItems().indexOf(@) >= 0
      return atom.workspace.getLeftDock();
    if atom.workspace.getRightDock().getPaneItems().indexOf(@) >= 0
      return atom.workspace.getRightDock();

    return null;

  isVisible: ->
    if @bottomPanel
      return @state.visible;
    else
      return @isVisibleInDock();

  isVisibleInDock: ->
    dock = @getDock();

    if !dock? or !dock.isVisible()
      return false;

    if !dock.getActivePane()?
      return false;

    return dock.getActivePane().getActiveItem() == @;

  toggle: ->
    if @isVisible()
      @hide();
    else
      @show(false);

  togglePanelVisible: ->
    if @bottomPanel.isVisible()
      @unfocus();
      @bottomPanel.hide();
    else
      @bottomPanel.show();

  show: (focus) ->
    if @bottomPanel?
      @showPanel(focus);
    else
      @showDock(focus);

    @state.visible = true;
    @saveState();

  showPanel: (focus) ->
    @bottomPanel.show();

    if focus
      @focus();

  showDock: (focus) ->
    atom.workspace.open(this, {
      searchAllPanes: true,
      activatePane: true,
      activateItem: true,
    }).then =>
      atom.workspace.paneContainerForURI(@getURI()).show()
      @focus() if focus

  hide: ->
    if @bottomPanel?
      @bottomPanel.hide();
    else
      atom.workspace.hide(this)

    @state.visible = false;
    @saveState();

  focus: ->
    @mainView.refocusLastView();
    # @element.focus()

  unfocus: ->
    atom.workspace.getCenter().activate()

  hasFocus: ->
    return (@mainView.focusedView != null) and @mainView.focusedView.hasFocus();
    # document.activeElement is @element

  toggleFocus: ->
    if @hasFocus()
      @unfocus()
    else
      @show(true)

  # showPanel: ->
  #   @show(false);
  #
  #   @bottomPanel.show();
  #   @saveState();

  # toggleFocus: ->
    # if @bottomPanel.isVisible()
    #   if (@mainView.focusedView != null) and @mainView.focusedView.hasFocus()
    #     @mainView.focusedView.unfocus();
    #   else
    #     @mainView.refocusLastView();
    # else
    #   @bottomPanel.show()
    #   @mainView.refocusLastView();
    #   @saveState();

  consumeStatusBar: (statusBar) ->
    @statusView = new StatusView();
    @statusTile = statusBar.addRightTile({item:@statusView});

  refreshStatus: ->
    if @statusView == null
      return;

    @statusView.setUploadCount(@serverManager.getUploadCount());
    @statusView.setDownloadCount(@serverManager.getDownloadCount());

  fileSystemRemoved: (fileSystem) ->
    @bookmarkManager.fileSystemRemoved(fileSystem);
    @mainView.fileSystemRemoved(fileSystem);

  serverClosed: (server) ->
    @mainView.serverClosed(server);

  getFileSystemWithID: (fileSystemId) ->
    if @localFileSystem.getID() == fileSystemId
      return @localFileSystem;

    return @serverManager.getFileSystemWithID(fileSystemId);
