MenuItem = require './menu-item'
{$, $$, View} = require 'atom-space-pen-views'

module.exports =
class MenuBarView extends View

  constructor: ->
    super();

  @content: ->
    @div {class: 'atom-commander-menu-bar'}, =>
      @div {class: 'buttons', outlet:'content'}
      @div {class: 'extra-buttons'}, =>
        @button {tabindex: -1, class: 'btn btn-sm inline-block settings-btn icon-gear', click: 'settingsPressed'}
      @div {class: 'details'}, =>
        @div {class: 'column'}, =>
          @div '1 Select', {class: 'title'}
          @div {class: 'body'}, =>
            @div 'All',  {class: 'item', click: 'selectAll'}
            @div 'None',  {class: 'item', click: 'selectNone'}
            @div 'Add to selection...',  {class: 'item', click: 'selectAdd'}
            @div 'Remove from selection...',  {class: 'item', click: 'selectRemove'}
            @div 'Invert selection',  {class: 'item', click: 'selectInvert'}
            @div 'Folders',  {class: 'item', click: 'selectFolders'}
            @div 'Files',  {class: 'item', click: 'selectFiles'}
        @div {class: 'column'}, =>
          @div '2 Go', {class: 'title'}
          @div {class: 'body'}, =>
            @div 'Project: Choose project folder to go to...',  {class: 'item', click: 'goProject'}
            @div 'Editor: Go to focused file in editor',  {class: 'item', click: 'goEditor'}
            @div 'Drive: Choose drive to go to...',  {class: 'item', click: 'goDrive'}
            @div 'Root: Go to current folder\'s root folder',  {class: 'item', click: 'goRoot'}
            @div 'Home: Go to user\'s home folder',  {class: 'item', click: 'goHome'}
        @div {class: 'column'}, =>
          @div '3 Bookmarks', {class: 'title'}
          @div {class: 'body'}, =>
            @div 'Add',  {class: 'item', click: 'bookmarksAdd'}
            @div 'Remove',  {class: 'item', click: 'bookmarksRemove'}
            @div 'Open',  {class: 'item', click: 'bookmarksOpen'}
        @div {class: 'column'}, =>
          @div '4 Servers', {class: 'title'}
          @div {class: 'body'}, =>
            @div 'Add',  {class: 'item', click: 'serversAdd'}
            @div 'Remove',  {class: 'item', click: 'serversRemove'}
            @div 'Open',  {class: 'item', click: 'serversOpen'}
            @div 'Close',  {class: 'item', click: 'serversClose'}
            @div 'Edit',  {class: 'item', click: 'serversEdit'}
            @div 'Cache',  {class: 'item', click: 'serversCache'}
        @div {class: 'column'}, =>
          @div '5 Open', {class: 'title'}
          @div {class: 'body'}, =>
            @div 'Terminal: Open terminal in current folder',  {class: 'item', click: 'openTerminal'}
            @div 'File manager: Open system file manager for selected item',  {class: 'item', click: 'openFileManager', outlet: 'fileManagerItem'}
            @div 'System: Open selected item with system default',  {class: 'item', click: 'openSystem'}
        @div {class: 'column'}, =>
          @div '6 View', {class: 'title'}
          @div {class: 'body'}, =>
            @div 'Refresh: Refresh content of focused pane',  {class: 'item', click: 'viewRefresh'}
            @div 'Mirror: Show same content in other pane',  {class: 'item', click: 'viewMirror'}
            @div 'Swap: Swap content of two panes',  {class: 'item', click: 'viewSwap'}
        @div {class: 'column'}, =>
          @div '7 Compare', {class: 'title'}
          @div {class: 'body'}, =>
            @div 'Folders: Highlight difference between the two panes',  {class: 'item', click: 'compareFolders'}
            @div 'Files: Show difference between content of highlighted files',  {class: 'item', click: 'compareFiles'}

  selectAll: -> @mainView.main.actions.selectAll()
  selectNone: -> @mainView.main.actions.selectNone()
  selectAdd: -> @mainView.main.actions.selectAdd()
  selectRemove: -> @mainView.main.actions.selectRemove()
  selectInvert: -> @mainView.main.actions.selectInvert()
  selectFolders: -> @mainView.main.actions.selectFolders()
  selectFiles: -> @mainView.main.actions.selectFiles()

  goProject: -> @mainView.main.actions.goProject();
  goEditor: -> @mainView.main.actions.goEditor();
  goDrive: -> @mainView.main.actions.goDrive();
  goRoot: -> @mainView.main.actions.goRoot();
  goHome: -> @mainView.main.actions.goHome();

  bookmarksAdd: -> @mainView.main.actions.bookmarksAdd();
  bookmarksRemove: -> @mainView.main.actions.bookmarksRemove();
  bookmarksOpen: -> @mainView.main.actions.bookmarksOpen();

  serversAdd: -> @mainView.main.actions.serversAdd();
  serversRemove: -> @mainView.main.actions.serversRemove();
  serversOpen: -> @mainView.main.actions.serversOpen();
  serversClose: -> @mainView.main.actions.serversClose();
  serversEdit: -> @mainView.main.actions.serversEdit();
  serversCache: -> @mainView.main.actions.serversCache();

  openTerminal: -> @mainView.main.actions.openTerminal();
  openFileManager: -> @mainView.main.actions.openFileSystem();
  openSystem: -> @mainView.main.actions.openSystem();

  viewRefresh: -> @mainView.main.actions.viewRefresh();
  viewMirror: -> @mainView.main.actions.viewMirror();
  viewSwap: -> @mainView.main.actions.viewSwap();

  compareFolders: -> @mainView.main.actions.compareFolders();
  compareFiles: -> @mainView.main.actions.compareFiles();

  setMainView: (@mainView) ->
    @rootMenuItem = @createRootMenuItem();
    @showMenuItem(@rootMenuItem);

    buttonClicked = @buttonClicked;

    @content.on 'click', 'button', ->
      buttonClicked($(this).text());

    if process.platform == "darwin"
      @fileManagerItem.text('Finder');
    else if process.platform == "win32"
      @fileManagerItem.text('Explorer');

  settingsPressed: =>
    @mainView.hideMenuBar();
    atom.workspace.open('atom://config/packages/atom-commander');

  buttonClicked: (title) =>
    if (title == "")
      @showParentMenuItem();
    else
      @handleMenuItem(@currentMenuItem.getMenuItemWithTitle(title));

  showParentMenuItem: ->
    if @currentMenuItem.parent == null
      @mainView.hideMenuBar();
    else
      @handleMenuItem(@currentMenuItem.parent);

  reset: ->
    @showMenuItem(@rootMenuItem);

  createRootMenuItem: ->
    actions = @mainView.main.actions;
    root = new MenuItem(null, "0", "root");

    select = root.addMenuItem("1", "Select");
    select.addMenuItem("1", "All", actions.selectAll);
    select.addMenuItem("2", "None", actions.selectNone);
    select.addMenuItem("3", "Add", actions.selectAdd);
    select.addMenuItem("4", "Remove", actions.selectRemove);
    select.addMenuItem("5", "Invert", actions.selectInvert);
    select.addMenuItem("6", "Folders", actions.selectFolders);
    select.addMenuItem("7", "Files", actions.selectFiles);

    go = root.addMenuItem("2", "Go");
    go.addMenuItem("1", "Project", actions.goProject);
    go.addMenuItem("2", "Editor", actions.goEditor);
    go.addMenuItem("3", "Drive", actions.goDrive);
    go.addMenuItem("4", "Root", actions.goRoot);
    go.addMenuItem("5", "Home", actions.goHome);

    bookmarks = root.addMenuItem("3", "Bookmarks");
    bookmarks.addMenuItem("1", "Add", actions.bookmarksAdd);
    bookmarks.addMenuItem("2", "Remove", actions.bookmarksRemove);
    bookmarks.addMenuItem("3", "Open", actions.bookmarksOpen);

    server = root.addMenuItem("4", "Servers");
    server.addMenuItem("1", "Add", actions.serversAdd);
    server.addMenuItem("2", "Remove", actions.serversRemove);
    server.addMenuItem("3", "Open", actions.serversOpen);
    server.addMenuItem("4", "Close", actions.serversClose);
    server.addMenuItem("5", "Edit", actions.serversEdit);
    server.addMenuItem("6", "Cache", actions.serversCache);

    open = root.addMenuItem("5", "Open");
    open.addMenuItem("1", "Terminal", actions.openTerminal);

    if process.platform == "darwin"
      open.addMenuItem("2", "Finder", actions.openFileSystem);
    else if process.platform == "win32"
      open.addMenuItem("2", "Explorer", actions.openFileSystem);
    else
      open.addMenuItem("2", "File Manager", actions.openFileSystem);

    open.addMenuItem("3", "System", actions.openSystem);

    view = root.addMenuItem("6", "View");
    view.addMenuItem("1", "Refresh", actions.viewRefresh);
    view.addMenuItem("2", "Mirror", actions.viewMirror);
    view.addMenuItem("3", "Swap", actions.viewSwap);

    compare = root.addMenuItem("7", "Compare");
    compare.addMenuItem("1", "Folders", actions.compareFolders);
    compare.addMenuItem("2", "Files", actions.compareFiles);

    return root;

  showMenuItem: (@currentMenuItem) ->
    @content.empty();

    @content.append $$ ->
      @button {class: 'btn icon-arrow-up inline-block'}

    for id in @currentMenuItem.ids
      subMenuItem = @currentMenuItem.getMenuItem(id);

      @content.append $$ ->
        @button subMenuItem.title, {class: 'btn btn-primary inline-block'}

  handleKeyDown: (event) ->
    charCode = event.which | event.keyCode;

    if event.shiftKey or (charCode == 27)
      @showParentMenuItem();

  handleKeyUp: (event) ->
    charCode = event.which | event.keyCode;

    # Not sure if this the right way, but on OSX it allows the keypad to be used.
    if charCode >= 96
      charCode -= 48;

    sCode = String.fromCharCode(charCode);

    if sCode == "0"
      @showParentMenuItem();
    else
      subMenuItem = @currentMenuItem.getMenuItem(sCode);
      @handleMenuItem(subMenuItem);

  handleMenuItem: (menuItem) ->
    if menuItem
      if menuItem.callback
        menuItem.callback();
      else
        @showMenuItem(menuItem);
