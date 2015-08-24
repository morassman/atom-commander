MenuItem = require './menu-item'
{$, $$, View} = require 'atom-space-pen-views'

module.exports =
class MenuBarView extends View

  constructor: ->
    super();

  @content: ->
    @div {class: 'atom-commander-menu-bar'}, =>
      @div {class:'block content', outlet:'content'}

  setMainView: (@mainView) ->
    @rootMenuItem = @createRootMenuItem();
    @showMenuItem(@rootMenuItem);

    buttonClicked = @buttonClicked;

    @content.on 'click', 'button', ->
      buttonClicked($(this).text());

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
    select.addMenuItem("3", "Invert", actions.selectInvert);
    select.addMenuItem("4", "Folders", actions.selectFolders);
    select.addMenuItem("5", "Files", actions.selectFiles);

    compare = root.addMenuItem("2", "Compare");
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
