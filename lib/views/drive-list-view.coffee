drivelist = require 'drivelist';
{Directory} = require 'atom'
{SelectListView} = require 'atom-space-pen-views'

module.exports =
class DriveListView extends SelectListView

  constructor: (@actions, @fromView) ->
    super();

  initialize: ->
    super();

    if process.platform == "darwin"
      @refreshDarwinItems();
    else
      drivelist.list (error, disks) =>
        if !error
          @refreshItems(disks);

    @addClass('overlay from-top');
    @panel ?= atom.workspace.addModalPanel(item: this);
    @panel.show();
    @focusFilterEditor();

  refreshDarwinItems: ->
    items = [];
    directory = new Directory("/Volumes");

    for entry in directory.getEntriesSync()
      if entry.isDirectory()
        items.push(@createDarwinItem(entry.getBaseName()));

    @setItems(items);

  refreshItems: (disks)->
    items = [];
    createItem = @createLinuxItem;

    if process.platform == "win32"
      createItem = @createWindowsItem;

    for disk in disks
      item = createItem(disk);

      if item != null
        items.push(item);

    @setItems(items);

  createDarwinItem: (volume) ->
    item = {};

    item.path = "/Volumes/"+volume;
    item.primary = volume;
    item.secondary = item.path;
    item.text = volume;

    return item;

  createLinuxItem: (disk) ->
    if !disk.mountpoint?
      return null;

    item = {};

    item.path = disk.mountpoint;
    item.primary = disk.mountpoint;
    item.secondary = disk.description;
    item.text = item.primary+" "+item.secondary;

    return item;

  createWindowsItem: (disk) ->
    item = {};

    item.path = disk.mountpoint+"\\";
    item.primary = disk.mountpoint;
    item.secondary = disk.description;
    item.text = item.primary+" "+item.secondary;

    return item;

  getFilterKey: ->
    return "text";

  viewForItem: (item) ->
    return """
    <li class='two-lines'>
    <div class='primary-line'>#{item.primary}</div>
    <div class='secondary-line'>#{item.secondary}</div>
    </li>"""

  confirmed: (item) ->
    @actions.goDirectory(new Directory(item.path));
    @cancel();

  cancelled: ->
    @hide();
    @panel?.destroy();

    if @fromView
      @actions.main.mainView.refocusLastView();
