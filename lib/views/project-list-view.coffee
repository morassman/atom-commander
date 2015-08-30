drivelist = require 'drivelist';
{Directory} = require 'atom'
{SelectListView} = require 'atom-space-pen-views'

module.exports =
class ProjectListView extends SelectListView

  constructor: (@actions, @fromView) ->
    super();

  initialize: ->
    super();

    @refreshItems();
    @addClass('overlay from-top');
    @panel ?= atom.workspace.addModalPanel(item: this);
    @panel.show();
    @focusFilterEditor();

  refreshItems: ->
    items = [];
    projects = atom.project.getDirectories();

    for project in projects
      items.push(@createItem(project));

    @setItems(items);

  createItem: (project) ->
    item = {};

    item.project = project;
    item.primary = project.getBaseName();
    item.secondary = project.getPath();

    return item;

  getFilterKey: ->
    return "secondary";

  viewForItem: (item) ->
    return """
    <li class='two-lines'>
    <div class='primary-line'>#{item.primary}</div>
    <div class='secondary-line'>#{item.secondary}</div>
    </li>"""

  confirmed: (item) ->
    @actions.goDirectory(item.project);
    @cancel();

  cancelled: ->
    @hide();
    @panel?.destroy();

    if @fromView
      @actions.main.mainView.refocusLastView();
