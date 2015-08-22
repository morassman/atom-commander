module.exports =
class MenuItem

  constructor: (@parent, @id, @name, @callback=null) ->
    @title = "#{@id} #{@name}";
    @ids = [];
    @subMenuItems = {};

  addMenuItem: (id, name, callback=null) ->
    subMenuItem = new MenuItem(@, id, name, callback);

    @ids.push(id);
    @subMenuItems[id] = subMenuItem;

    return subMenuItem;

  getMenuItem: (id) ->
    return @subMenuItems[id];

  getMenuItemWithTitle: (title) ->
    for id in @ids
      subMenuItem = @subMenuItems[id];

      if subMenuItem.title == title
        return subMenuItem;

    return null;
