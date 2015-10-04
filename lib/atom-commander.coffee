fsp = require 'fs-plus'
Actions = require './actions'
ListView = require './views/list-view'
DiffView = require './views/diff/diff-view'
StatusView = require './views/status-view'
AtomCommanderView = require './atom-commander-view'
BookmarkManager = require './bookmark-manager'
ServerManager = require './servers/server-manager'
LocalFileSystem = require './fs/local/local-filesystem'
{CompositeDisposable, File, Directory} = require 'atom'

module.exports = AtomCommander =

  config:
    uploadOnSave:
      description: "Automatically upload cached files when saved."
      type: "boolean"
      default: true
    deleteOnClose:
      description: "Delete cached files when closed and were successfully uploaded."
      type: "boolean"
      default: true

  activate: (@state) ->
    @loadState();
    @bookmarks = [];

    @localFileSystem = new LocalFileSystem();
    @actions = new Actions(@);
    @bookmarkManager = new BookmarkManager(@, @state.bookmarks);
    @serverManager = new ServerManager(@, @state.servers);
    @mainView = new AtomCommanderView(@, @state);
    @bottomPanel = atom.workspace.addBottomPanel(item: @mainView.getElement(), visible: false);

    @subscriptions = new CompositeDisposable();

    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:toggle-visible': => @toggleVisible();
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:toggle-focus': => @toggleFocus();

    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:select-all': => @actions.selectAll();
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:select-none': => @actions.selectNone();
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:select-add': => @actions.selectAdd();
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:select-remove': => @actions.selectRemove();
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:select-invert': => @actions.selectInvert();
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:select-folders': => @actions.selectFolders();
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:select-files': => @actions.selectFiles();

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
    @subscriptions.add atom.commands.add 'atom-workspace', 'atom-commander:open-cache': => @actions.serversCache(false);

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

    if @state.visible
      @bottomPanel.show();

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
      @state = {};
      @state.bookmarks = [];
      @state.visible = false;

    file = @getSaveFile();

    if !file.existsSync()
      return;

    try
      @state = JSON.parse(fsp.readFileSync(file.getPath()));
    catch error
      console.log("Error loading Atom Commander state.");
      console.log(error);

  saveState: ->
    state = @serialize();
    file = @getSaveFile();
    state.version = 1;

    try
      fsp.writeFileSync(file.getPath(), JSON.stringify(state));
    catch error
      console.log("Error saving Atom Commander state.");
      console.log(error);

  deactivate: ->
    @saveState();
    @bottomPanel.destroy();
    @subscriptions.dispose();
    @serverManager.dispose();
    @mainView.destroy();
    @statusView?.destroy();
    @statusTile?.destroy()

  serialize: ->
    if @mainView != null
      state = @mainView.serialize();
      state.visible = @bottomPanel.isVisible();
      state.bookmarks = @bookmarkManager.serialize();
      state.servers = @serverManager.serialize();
      return state;

    return @state;

  toggleVisible: ->
    if @bottomPanel.isVisible()
      if (@mainView.focusedView != null) and @mainView.focusedView.hasFocus()
        @mainView.focusedView.unfocus();

      @bottomPanel.hide();
    else
      @bottomPanel.show();

    @saveState();

  hidePanel: ->
    @bottomPanel.hide();
    @saveState();

  toggleFocus: ->
    if @bottomPanel.isVisible()
      if (@mainView.focusedView != null) and @mainView.focusedView.hasFocus()
        @mainView.focusedView.unfocus();
      else
        @mainView.refocusLastView();
    else
      @bottomPanel.show()
      @mainView.refocusLastView();
      @saveState();

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
