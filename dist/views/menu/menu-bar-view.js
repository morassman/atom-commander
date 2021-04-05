var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/*
 * decaffeinate suggestions:
 * DS002: Fix invalid constructor
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var MenuBarView;
var MenuItem = require('./menu-item');
var _a = require('atom-space-pen-views'), $ = _a.$, $$ = _a.$$, View = _a.View;
module.exports =
    (MenuBarView = /** @class */ (function (_super) {
        __extends(MenuBarView, _super);
        function MenuBarView() {
            var _this = this;
            _this.settingsPressed = _this.settingsPressed.bind(_this);
            _this.buttonClicked = _this.buttonClicked.bind(_this);
            _this = _super.call(this) || this;
            return _this;
        }
        MenuBarView.content = function () {
            var _this = this;
            return this.div({ "class": 'atom-commander-menu-bar' }, function () {
                _this.div({ "class": 'buttons', outlet: 'content' });
                _this.div({ "class": 'extra-buttons' }, function () {
                    return _this.button({ tabindex: -1, "class": 'btn btn-sm inline-block icon-gear', click: 'settingsPressed' });
                });
                return _this.div({ outlet: 'details' }, function () {
                    return _this.div({ "class": 'details' }, function () {
                        _this.div({ "class": 'column' }, function () {
                            _this.div('1 Select', { "class": 'title' });
                            return _this.div({ "class": 'body' }, function () {
                                _this.div({ "class": 'item', click: 'selectAll' }, function () {
                                    _this.div('1');
                                    return _this.div('All', { "class": 'description' });
                                });
                                _this.div({ "class": 'item', click: 'selectNone' }, function () {
                                    _this.div('2');
                                    return _this.div('None', { "class": 'description' });
                                });
                                _this.div({ "class": 'item', click: 'selectAdd' }, function () {
                                    _this.div('3');
                                    return _this.div('Add to selection...', { "class": 'description' });
                                });
                                _this.div({ "class": 'item', click: 'selectRemove' }, function () {
                                    _this.div('4');
                                    return _this.div('Remove from selection...', { "class": 'description' });
                                });
                                _this.div({ "class": 'item', click: 'selectInvert' }, function () {
                                    _this.div('5');
                                    return _this.div('Invert selection', { "class": 'description' });
                                });
                                _this.div({ "class": 'item', click: 'selectFolders' }, function () {
                                    _this.div('6');
                                    return _this.div('Folders', { "class": 'description' });
                                });
                                return _this.div({ "class": 'item', click: 'selectFiles' }, function () {
                                    _this.div('7');
                                    return _this.div('Files', { "class": 'description' });
                                });
                            });
                        });
                        _this.div({ "class": 'column' }, function () {
                            _this.div('2 Go', { "class": 'title' });
                            return _this.div({ "class": 'body' }, function () {
                                _this.div({ "class": 'item', click: 'goProject' }, function () {
                                    _this.div('1');
                                    return _this.div('Project - Choose project folder to go to...', { "class": 'description' });
                                });
                                _this.div({ "class": 'item', click: 'goEditor' }, function () {
                                    _this.div('2');
                                    return _this.div('Editor - Go to focused file in editor', { "class": 'description' });
                                });
                                _this.div({ "class": 'item', click: 'goDrive' }, function () {
                                    _this.div('3');
                                    return _this.div('Drive - Choose drive to go to...', { "class": 'description' });
                                });
                                _this.div({ "class": 'item', click: 'goRoot' }, function () {
                                    _this.div('4');
                                    return _this.div('Root - Go to current folder\'s root folder', { "class": 'description' });
                                });
                                return _this.div({ "class": 'item', click: 'goHome' }, function () {
                                    _this.div('5');
                                    return _this.div('Home - Go to user\'s home folder', { "class": 'description' });
                                });
                            });
                        });
                        _this.div({ "class": 'column' }, function () {
                            _this.div('3 Bookmarks', { "class": 'title' });
                            return _this.div({ "class": 'body' }, function () {
                                _this.div({ "class": 'item', click: 'bookmarksAdd' }, function () {
                                    _this.div('1');
                                    return _this.div('Add', { "class": 'description' });
                                });
                                _this.div({ "class": 'item', click: 'bookmarksRemove' }, function () {
                                    _this.div('2');
                                    return _this.div('Remove', { "class": 'description' });
                                });
                                return _this.div({ "class": 'item', click: 'bookmarksOpen' }, function () {
                                    _this.div('3');
                                    return _this.div('Open', { "class": 'description' });
                                });
                            });
                        });
                        _this.div({ "class": 'column' }, function () {
                            _this.div('4 Servers', { "class": 'title' });
                            return _this.div({ "class": 'body' }, function () {
                                _this.div({ "class": 'item', click: 'serversAdd' }, function () {
                                    _this.div('1');
                                    return _this.div('Add', { "class": 'description' });
                                });
                                _this.div({ "class": 'item', click: 'serversRemove' }, function () {
                                    _this.div('2');
                                    return _this.div('Remove', { "class": 'description' });
                                });
                                _this.div({ "class": 'item', click: 'serversOpen' }, function () {
                                    _this.div('3');
                                    return _this.div('Open', { "class": 'description' });
                                });
                                _this.div({ "class": 'item', click: 'serversClose' }, function () {
                                    _this.div('4');
                                    return _this.div('Close', { "class": 'description' });
                                });
                                _this.div({ "class": 'item', click: 'serversEdit' }, function () {
                                    _this.div('5');
                                    return _this.div('Edit', { "class": 'description' });
                                });
                                return _this.div({ "class": 'item', click: 'serversCache' }, function () {
                                    _this.div('6');
                                    return _this.div('Cache - View cached files', { "class": 'description' });
                                });
                            });
                        });
                        _this.div({ "class": 'column' }, function () {
                            _this.div('5 Open', { "class": 'title' });
                            return _this.div({ "class": 'body' }, function () {
                                _this.div({ "class": 'item', click: 'openTerminal' }, function () {
                                    _this.div('1');
                                    return _this.div('Terminal - Open terminal in current folder', { "class": 'description' });
                                });
                                _this.div({ "class": 'item', click: 'openFileManager' }, function () {
                                    _this.div('2');
                                    return _this.div('File manager - Show highlighted item in system file manager', { "class": 'description', outlet: 'fileManagerItem' });
                                });
                                return _this.div({ "class": 'item', click: 'openSystem' }, function () {
                                    _this.div('3');
                                    return _this.div('System - Open highlighted item with system default', { "class": 'description' });
                                });
                            });
                        });
                        _this.div({ "class": 'column' }, function () {
                            _this.div('6 View', { "class": 'title' });
                            return _this.div({ "class": 'body' }, function () {
                                _this.div({ "class": 'item', click: 'viewRefresh' }, function () {
                                    _this.div('1');
                                    return _this.div('Refresh - Refresh content of focused pane', { "class": 'description' });
                                });
                                _this.div({ "class": 'item', click: 'viewMirror' }, function () {
                                    _this.div('2');
                                    return _this.div('Mirror - Show same content in other pane', { "class": 'description' });
                                });
                                return _this.div({ "class": 'item', click: 'viewSwap' }, function () {
                                    _this.div('3');
                                    return _this.div('Swap - Swap content of two panes', { "class": 'description' });
                                });
                            });
                        });
                        return _this.div({ "class": 'column' }, function () {
                            _this.div('7 Compare', { "class": 'title' });
                            return _this.div({ "class": 'body' }, function () {
                                _this.div({ "class": 'item', click: 'compareFolders' }, function () {
                                    _this.div('1');
                                    return _this.div('Folders - Highlight difference between the two panes', { "class": 'description' });
                                });
                                return _this.div({ "class": 'item', click: 'compareFiles' }, function () {
                                    _this.div('2');
                                    return _this.div('Files - Show difference between content of highlighted files', { "class": 'description' });
                                });
                            });
                        });
                    });
                });
            });
        };
        MenuBarView.prototype.dispose = function () {
            return this.configDisposable.dispose();
        };
        MenuBarView.prototype.selectAll = function () { return this.mainView.main.actions.selectAll(); };
        MenuBarView.prototype.selectNone = function () { return this.mainView.main.actions.selectNone(); };
        MenuBarView.prototype.selectAdd = function () { return this.mainView.main.actions.selectAdd(); };
        MenuBarView.prototype.selectRemove = function () { return this.mainView.main.actions.selectRemove(); };
        MenuBarView.prototype.selectInvert = function () { return this.mainView.main.actions.selectInvert(); };
        MenuBarView.prototype.selectFolders = function () { return this.mainView.main.actions.selectFolders(); };
        MenuBarView.prototype.selectFiles = function () { return this.mainView.main.actions.selectFiles(); };
        MenuBarView.prototype.goProject = function () { return this.mainView.main.actions.goProject(); };
        MenuBarView.prototype.goEditor = function () { return this.mainView.main.actions.goEditor(); };
        MenuBarView.prototype.goDrive = function () { return this.mainView.main.actions.goDrive(); };
        MenuBarView.prototype.goRoot = function () { return this.mainView.main.actions.goRoot(); };
        MenuBarView.prototype.goHome = function () { return this.mainView.main.actions.goHome(); };
        MenuBarView.prototype.bookmarksAdd = function () { return this.mainView.main.actions.bookmarksAdd(); };
        MenuBarView.prototype.bookmarksRemove = function () { return this.mainView.main.actions.bookmarksRemove(); };
        MenuBarView.prototype.bookmarksOpen = function () { return this.mainView.main.actions.bookmarksOpen(); };
        MenuBarView.prototype.serversAdd = function () { return this.mainView.main.actions.serversAdd(); };
        MenuBarView.prototype.serversRemove = function () { return this.mainView.main.actions.serversRemove(); };
        MenuBarView.prototype.serversOpen = function () { return this.mainView.main.actions.serversOpen(); };
        MenuBarView.prototype.serversClose = function () { return this.mainView.main.actions.serversClose(); };
        MenuBarView.prototype.serversEdit = function () { return this.mainView.main.actions.serversEdit(); };
        MenuBarView.prototype.serversCache = function () { return this.mainView.main.actions.serversCache(); };
        MenuBarView.prototype.openTerminal = function () { return this.mainView.main.actions.openTerminal(); };
        MenuBarView.prototype.openFileManager = function () { return this.mainView.main.actions.openFileSystem(); };
        MenuBarView.prototype.openSystem = function () { return this.mainView.main.actions.openSystem(); };
        MenuBarView.prototype.viewRefresh = function () { return this.mainView.main.actions.viewRefresh(); };
        MenuBarView.prototype.viewMirror = function () { return this.mainView.main.actions.viewMirror(); };
        MenuBarView.prototype.viewSwap = function () { return this.mainView.main.actions.viewSwap(); };
        MenuBarView.prototype.compareFolders = function () { return this.mainView.main.actions.compareFolders(); };
        MenuBarView.prototype.compareFiles = function () { return this.mainView.main.actions.compareFiles(); };
        MenuBarView.prototype.setMainView = function (mainView) {
            var _this = this;
            this.mainView = mainView;
            this.rootMenuItem = this.createRootMenuItem();
            this.showMenuItem(this.rootMenuItem);
            var buttonClicked = this.buttonClicked;
            this.content.on('click', 'button', function () {
                return buttonClicked($(this).text());
            });
            if (process.platform === "darwin") {
                this.fileManagerItem.text('Finder - Show highlighted item in Finder');
            }
            else if (process.platform === "win32") {
                this.fileManagerItem.text('Explorer - Show highlighted item in Explorer');
            }
            return this.configDisposable = atom.config.observe('atom-commander.menu.showMenuDetails', function (value) {
                if (value) {
                    return _this.details.show();
                }
                else {
                    return _this.details.hide();
                }
            });
        };
        MenuBarView.prototype.settingsPressed = function () {
            this.mainView.hideMenuBar();
            return atom.workspace.open('atom://config/packages/atom-commander');
        };
        MenuBarView.prototype.buttonClicked = function (title) {
            if (title === "") {
                return this.showParentMenuItem();
            }
            else {
                return this.handleMenuItem(this.currentMenuItem.getMenuItemWithTitle(title));
            }
        };
        MenuBarView.prototype.showParentMenuItem = function () {
            if (this.currentMenuItem.parent === null) {
                return this.mainView.hideMenuBar();
            }
            else {
                return this.handleMenuItem(this.currentMenuItem.parent);
            }
        };
        MenuBarView.prototype.reset = function () {
            return this.showMenuItem(this.rootMenuItem);
        };
        MenuBarView.prototype.createRootMenuItem = function () {
            var actions = this.mainView.main.actions;
            var root = new MenuItem(null, "0", "root");
            var select = root.addMenuItem("1", "Select");
            select.addMenuItem("1", "All", actions.selectAll);
            select.addMenuItem("2", "None", actions.selectNone);
            select.addMenuItem("3", "Add", actions.selectAdd);
            select.addMenuItem("4", "Remove", actions.selectRemove);
            select.addMenuItem("5", "Invert", actions.selectInvert);
            select.addMenuItem("6", "Folders", actions.selectFolders);
            select.addMenuItem("7", "Files", actions.selectFiles);
            var go = root.addMenuItem("2", "Go");
            go.addMenuItem("1", "Project", actions.goProject);
            go.addMenuItem("2", "Editor", actions.goEditor);
            go.addMenuItem("3", "Drive", actions.goDrive);
            go.addMenuItem("4", "Root", actions.goRoot);
            go.addMenuItem("5", "Home", actions.goHome);
            var bookmarks = root.addMenuItem("3", "Bookmarks");
            bookmarks.addMenuItem("1", "Add", actions.bookmarksAdd);
            bookmarks.addMenuItem("2", "Remove", actions.bookmarksRemove);
            bookmarks.addMenuItem("3", "Open", actions.bookmarksOpen);
            var server = root.addMenuItem("4", "Servers");
            server.addMenuItem("1", "Add", actions.serversAdd);
            server.addMenuItem("2", "Remove", actions.serversRemove);
            server.addMenuItem("3", "Open", actions.serversOpen);
            server.addMenuItem("4", "Close", actions.serversClose);
            server.addMenuItem("5", "Edit", actions.serversEdit);
            server.addMenuItem("6", "Cache", actions.serversCache);
            var open = root.addMenuItem("5", "Open");
            open.addMenuItem("1", "Terminal", actions.openTerminal);
            if (process.platform === "darwin") {
                open.addMenuItem("2", "Finder", actions.openFileSystem);
            }
            else if (process.platform === "win32") {
                open.addMenuItem("2", "Explorer", actions.openFileSystem);
            }
            else {
                open.addMenuItem("2", "File Manager", actions.openFileSystem);
            }
            open.addMenuItem("3", "System", actions.openSystem);
            var view = root.addMenuItem("6", "View");
            view.addMenuItem("1", "Refresh", actions.viewRefresh);
            view.addMenuItem("2", "Mirror", actions.viewMirror);
            view.addMenuItem("3", "Swap", actions.viewSwap);
            var compare = root.addMenuItem("7", "Compare");
            compare.addMenuItem("1", "Folders", actions.compareFolders);
            compare.addMenuItem("2", "Files", actions.compareFiles);
            return root;
        };
        MenuBarView.prototype.showMenuItem = function (currentMenuItem) {
            var _this = this;
            this.currentMenuItem = currentMenuItem;
            this.content.empty();
            this.content.append($$(function () {
                return this.button({ "class": 'btn icon-arrow-up inline-block' });
            }));
            return (function () {
                var result = [];
                for (var _i = 0, _a = Array.from(_this.currentMenuItem.ids); _i < _a.length; _i++) {
                    var id = _a[_i];
                    var subMenuItem = _this.currentMenuItem.getMenuItem(id);
                    result.push(_this.content.append($$(function () {
                        return this.button(subMenuItem.title, { "class": 'btn btn-primary inline-block' });
                    })));
                }
                return result;
            })();
        };
        MenuBarView.prototype.handleKeyDown = function (event) {
            var charCode = event.which | event.keyCode;
            if (event.shiftKey || (charCode === 27)) {
                return this.showParentMenuItem();
            }
        };
        MenuBarView.prototype.handleKeyUp = function (event) {
            var charCode = event.which | event.keyCode;
            // Not sure if this the right way, but on OSX it allows the keypad to be used.
            if (charCode >= 96) {
                charCode -= 48;
            }
            var sCode = String.fromCharCode(charCode);
            if (sCode === "0") {
                return this.showParentMenuItem();
            }
            else {
                var subMenuItem = this.currentMenuItem.getMenuItem(sCode);
                return this.handleMenuItem(subMenuItem);
            }
        };
        MenuBarView.prototype.handleMenuItem = function (menuItem) {
            if (menuItem) {
                if (menuItem.callback) {
                    return menuItem.callback();
                }
                else {
                    return this.showMenuItem(menuItem);
                }
            }
        };
        return MenuBarView;
    }(View)));
//# sourceMappingURL=menu-bar-view.js.map