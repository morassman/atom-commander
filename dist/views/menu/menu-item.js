/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var MenuItem;
module.exports =
    (MenuItem = /** @class */ (function () {
        function MenuItem(parent, id, name, callback) {
            if (callback === void 0) { callback = null; }
            this.parent = parent;
            this.id = id;
            this.name = name;
            this.callback = callback;
            this.title = this.id + " " + this.name;
            this.ids = [];
            this.subMenuItems = {};
        }
        MenuItem.prototype.addMenuItem = function (id, name, callback) {
            if (callback === void 0) { callback = null; }
            var subMenuItem = new MenuItem(this, id, name, callback);
            this.ids.push(id);
            this.subMenuItems[id] = subMenuItem;
            return subMenuItem;
        };
        MenuItem.prototype.getMenuItem = function (id) {
            return this.subMenuItems[id];
        };
        MenuItem.prototype.getMenuItemWithTitle = function (title) {
            for (var _i = 0, _a = Array.from(this.ids); _i < _a.length; _i++) {
                var id = _a[_i];
                var subMenuItem = this.subMenuItems[id];
                if (subMenuItem.title === title) {
                    return subMenuItem;
                }
            }
            return null;
        };
        return MenuItem;
    }()));
//# sourceMappingURL=menu-item.js.map