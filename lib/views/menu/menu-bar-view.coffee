MenuItem = require './menu-item'
{$, $$, View} = require 'atom-space-pen-views'

module.exports =
class MenuBarView extends View

  constructor: ->
    super();

  @content: ->
    @div {class: 'atom-commander-menu-bar'}, =>
      @div {class:'content', outlet:'content'}
      @button {tabindex: -1, class: 'btn btn-sm inline-block settings-btn icon-gear', click: "settingsPressed"}

  setMainView: (@mainView) ->
    @rootMenuItem = @createRootMenuItem();
    @showMenuItem(@rootMenuItem);

    buttonClicked = @buttonClicked;

    @content.on 'click', 'button', ->
      buttonClicked($(this).text());

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
