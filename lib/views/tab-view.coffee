{View} = require 'atom-space-pen-views'

module.exports =
class TabView extends View

  constructor: (@tabsView, @view) ->
    super();
    @view.setTabView(@);

  @content: () ->
    @div {class: "atom-commander-tab-view inline-block-tight", click: "select"}

  getView: ->
    return @view;

  destroy: ->
    @view.dispose();
    @element.remove();

  getElement: ->
    return @element;

  # Called by the view when the directory has changed.
  directoryChanged: ->
    directory = @view.directory;

    if directory == null
      return;

    name = directory.getBaseName();

    if name.length == 0
      fileSystem = directory.getFileSystem();

      if fileSystem.isLocal()
        name = directory.getURI();
      else
        name = fileSystem.getName();

    @text(name);

  removeButtonPressed: ->

  select: (requestFocus=true)->
    if @isSelected()
      return;

    @tabsView.selectTab(@, requestFocus);

  setSelected: (selected) ->
    @removeClass("atom-commander-tab-view-selected");
    @removeClass("text-highlight");
    @removeClass("text-subtle");

    if selected
      @addClass("atom-commander-tab-view-selected");
      @addClass("text-highlight");
      @element.scrollIntoView();
    else
      @addClass("text-subtle");

  scrollIntoView: ->
    @element.scrollIntoView();

  isSelected: ->
    return @hasClass("atom-commander-tab-view-selected");

  serialize: ->
    return @view.serialize();

  deserialize: (state) ->
    @view.deserialize(null, state);
