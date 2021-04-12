/*
 * decaffeinate suggestions:
 * DS002: Fix invalid constructor
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let MenuBarView;
const MenuItem = require('./menu-item');
const {$, $$, View} = require('atom-space-pen-views');

module.exports =
(MenuBarView = class MenuBarView extends View {

  constructor() {
    this.settingsPressed = this.settingsPressed.bind(this);
    this.buttonClicked = this.buttonClicked.bind(this);
    super();
  }

  static content() {
    return this.div({class: 'atom-commander-menu-bar'}, () => {
      this.div({class: 'buttons', outlet: 'content'});
      this.div({class: 'extra-buttons'}, () => {
        return this.button({tabindex: -1, class: 'btn btn-sm inline-block icon-gear', click: 'settingsPressed'});
    });
      return this.div({outlet: 'details'}, () => {
        return this.div({class: 'details'}, () => {
          this.div({class: 'column'}, () => {
            this.div('1 Select', {class: 'title'});
            return this.div({class: 'body'}, () => {
              this.div({class: 'item', click: 'selectAll'}, () => {
                this.div('1');
                return this.div('All', {class: 'description'});
            });
              this.div({class: 'item', click: 'selectNone'}, () => {
                this.div('2');
                return this.div('None', {class: 'description'});
            });
              this.div({class: 'item', click: 'selectAdd'}, () => {
                this.div('3');
                return this.div('Add to selection...', {class: 'description'});
            });
              this.div({class: 'item', click: 'selectRemove'}, () => {
                this.div('4');
                return this.div('Remove from selection...', {class: 'description'});
            });
              this.div({class: 'item', click: 'selectInvert'}, () => {
                this.div('5');
                return this.div('Invert selection', {class: 'description'});
            });
              this.div({class: 'item', click: 'selectFolders'}, () => {
                this.div('6');
                return this.div('Folders', {class: 'description'});
            });
              return this.div({class: 'item', click: 'selectFiles'}, () => {
                this.div('7');
                return this.div('Files', {class: 'description'});
            });
          });
        });
          this.div({class: 'column'}, () => {
            this.div('2 Go', {class: 'title'});
            return this.div({class: 'body'}, () => {
              this.div({class: 'item', click: 'goProject'}, () => {
                this.div('1');
                return this.div('Project - Choose project folder to go to...', {class: 'description'});
            });
              this.div({class: 'item', click: 'goEditor'}, () => {
                this.div('2');
                return this.div('Editor - Go to focused file in editor', {class: 'description'});
            });
              this.div({class: 'item', click: 'goDrive'}, () => {
                this.div('3');
                return this.div('Drive - Choose drive to go to...', {class: 'description'});
            });
              this.div({class: 'item', click: 'goRoot'}, () => {
                this.div('4');
                return this.div('Root - Go to current folder\'s root folder', {class: 'description'});
            });
              return this.div({class: 'item', click: 'goHome'}, () => {
                this.div('5');
                return this.div('Home - Go to user\'s home folder', {class: 'description'});
            });
          });
        });
          this.div({class: 'column'}, () => {
            this.div('3 Bookmarks', {class: 'title'});
            return this.div({class: 'body'}, () => {
              this.div({class: 'item', click: 'bookmarksAdd'}, () => {
                this.div('1');
                return this.div('Add', {class: 'description'});
            });
              this.div({class: 'item', click: 'bookmarksRemove'}, () => {
                this.div('2');
                return this.div('Remove', {class: 'description'});
            });
              return this.div({class: 'item', click: 'bookmarksOpen'}, () => {
                this.div('3');
                return this.div('Open', {class: 'description'});
            });
          });
        });
          this.div({class: 'column'}, () => {
            this.div('4 Servers', {class: 'title'});
            return this.div({class: 'body'}, () => {
              this.div({class: 'item', click: 'serversAdd'}, () => {
                this.div('1');
                return this.div('Add', {class: 'description'});
            });
              this.div({class: 'item', click: 'serversRemove'}, () => {
                this.div('2');
                return this.div('Remove', {class: 'description'});
            });
              this.div({class: 'item', click: 'serversOpen'}, () => {
                this.div('3');
                return this.div('Open', {class: 'description'});
            });
              this.div({class: 'item', click: 'serversClose'}, () => {
                this.div('4');
                return this.div('Close', {class: 'description'});
            });
              this.div({class: 'item', click: 'serversEdit'}, () => {
                this.div('5');
                return this.div('Edit', {class: 'description'});
            });
              return this.div({class: 'item', click: 'serversCache'}, () => {
                this.div('6');
                return this.div('Cache - View cached files', {class: 'description'});
            });
          });
        });
          this.div({class: 'column'}, () => {
            this.div('5 Open', {class: 'title'});
            return this.div({class: 'body'}, () => {
              this.div({class: 'item', click: 'openTerminal'}, () => {
                this.div('1');
                return this.div('Terminal - Open terminal in current folder', {class: 'description'});
            });
              this.div({class: 'item', click: 'openFileManager'}, () => {
                this.div('2');
                return this.div('File manager - Show highlighted item in system file manager', {class: 'description', outlet: 'fileManagerItem'});
            });
              return this.div({class: 'item', click: 'openSystem'}, () => {
                this.div('3');
                return this.div('System - Open highlighted item with system default', {class: 'description'});
            });
          });
        });
          this.div({class: 'column'}, () => {
            this.div('6 View', {class: 'title'});
            return this.div({class: 'body'}, () => {
              this.div({class: 'item', click: 'viewRefresh'}, () => {
                this.div('1');
                return this.div('Refresh - Refresh content of focused pane', {class: 'description'});
            });
              this.div({class: 'item', click: 'viewMirror'}, () => {
                this.div('2');
                return this.div('Mirror - Show same content in other pane', {class: 'description'});
            });
              return this.div({class: 'item', click: 'viewSwap'}, () => {
                this.div('3');
                return this.div('Swap - Swap content of two panes', {class: 'description'});
            });
          });
        });
          return this.div({class: 'column'}, () => {
            this.div('7 Compare', {class: 'title'});
            return this.div({class: 'body'}, () => {
              this.div({class: 'item', click: 'compareFolders'}, () => {
                this.div('1');
                return this.div('Folders - Highlight difference between the two panes', {class: 'description'});
            });
              return this.div({class: 'item', click: 'compareFiles'}, () => {
                this.div('2');
                return this.div('Files - Show difference between content of highlighted files', {class: 'description'});
            });
          });
        });
      });
    });
  });
  }

  dispose() {
    return this.configDisposable.dispose();
  }

  selectAll() { return this.mainView.main.actions.selectAll(); }
  selectNone() { return this.mainView.main.actions.selectNone(); }
  selectAdd() { return this.mainView.main.actions.selectAdd(); }
  selectRemove() { return this.mainView.main.actions.selectRemove(); }
  selectInvert() { return this.mainView.main.actions.selectInvert(); }
  selectFolders() { return this.mainView.main.actions.selectFolders(); }
  selectFiles() { return this.mainView.main.actions.selectFiles(); }

  goProject() { return this.mainView.main.actions.goProject(); }
  goEditor() { return this.mainView.main.actions.goEditor(); }
  goDrive() { return this.mainView.main.actions.goDrive(); }
  goRoot() { return this.mainView.main.actions.goRoot(); }
  goHome() { return this.mainView.main.actions.goHome(); }

  bookmarksAdd() { return this.mainView.main.actions.bookmarksAdd(); }
  bookmarksRemove() { return this.mainView.main.actions.bookmarksRemove(); }
  bookmarksOpen() { return this.mainView.main.actions.bookmarksOpen(); }

  serversAdd() { return this.mainView.main.actions.serversAdd(); }
  serversRemove() { return this.mainView.main.actions.serversRemove(); }
  serversOpen() { return this.mainView.main.actions.serversOpen(); }
  serversClose() { return this.mainView.main.actions.serversClose(); }
  serversEdit() { return this.mainView.main.actions.serversEdit(); }
  serversCache() { return this.mainView.main.actions.serversCache(); }

  openTerminal() { return this.mainView.main.actions.openTerminal(); }
  openFileManager() { return this.mainView.main.actions.openFileSystem(); }
  openSystem() { return this.mainView.main.actions.openSystem(); }

  viewRefresh() { return this.mainView.main.actions.viewRefresh(); }
  viewMirror() { return this.mainView.main.actions.viewMirror(); }
  viewSwap() { return this.mainView.main.actions.viewSwap(); }

  compareFolders() { return this.mainView.main.actions.compareFolders(); }
  compareFiles() { return this.mainView.main.actions.compareFiles(); }

  setMainView(mainView) {
    this.mainView = mainView;
    this.rootMenuItem = this.createRootMenuItem();
    this.showMenuItem(this.rootMenuItem);

    const {
      buttonClicked
    } = this;

    this.content.on('click', 'button', function() {
      return buttonClicked($(this).text());
    });

    if (process.platform === "darwin") {
      this.fileManagerItem.text('Finder - Show highlighted item in Finder');
    } else if (process.platform === "win32") {
      this.fileManagerItem.text('Explorer - Show highlighted item in Explorer');
    }

    return this.configDisposable = atom.config.observe('atom-commander.menu.showMenuDetails', value => {
      if (value) {
        return this.details.show();
      } else {
        return this.details.hide();
      }
    });
  }

  settingsPressed() {
    this.mainView.hideMenuBar();
    return atom.workspace.open('atom://config/packages/atom-commander');
  }

  buttonClicked(title) {
    if (title === "") {
      return this.showParentMenuItem();
    } else {
      return this.handleMenuItem(this.currentMenuItem.getMenuItemWithTitle(title));
    }
  }

  showParentMenuItem() {
    if (this.currentMenuItem.parent === null) {
      return this.mainView.hideMenuBar();
    } else {
      return this.handleMenuItem(this.currentMenuItem.parent);
    }
  }

  reset() {
    return this.showMenuItem(this.rootMenuItem);
  }

  createRootMenuItem() {
    const {
      actions
    } = this.mainView.main;
    const root = new MenuItem(null, "0", "root");

    const select = root.addMenuItem("1", "Select");
    select.addMenuItem("1", "All", actions.selectAll);
    select.addMenuItem("2", "None", actions.selectNone);
    select.addMenuItem("3", "Add", actions.selectAdd);
    select.addMenuItem("4", "Remove", actions.selectRemove);
    select.addMenuItem("5", "Invert", actions.selectInvert);
    select.addMenuItem("6", "Folders", actions.selectFolders);
    select.addMenuItem("7", "Files", actions.selectFiles);

    const go = root.addMenuItem("2", "Go");
    go.addMenuItem("1", "Project", actions.goProject);
    go.addMenuItem("2", "Editor", actions.goEditor);
    go.addMenuItem("3", "Drive", actions.goDrive);
    go.addMenuItem("4", "Root", actions.goRoot);
    go.addMenuItem("5", "Home", actions.goHome);

    const bookmarks = root.addMenuItem("3", "Bookmarks");
    bookmarks.addMenuItem("1", "Add", actions.bookmarksAdd);
    bookmarks.addMenuItem("2", "Remove", actions.bookmarksRemove);
    bookmarks.addMenuItem("3", "Open", actions.bookmarksOpen);

    const server = root.addMenuItem("4", "Servers");
    server.addMenuItem("1", "Add", actions.serversAdd);
    server.addMenuItem("2", "Remove", actions.serversRemove);
    server.addMenuItem("3", "Open", actions.serversOpen);
    server.addMenuItem("4", "Close", actions.serversClose);
    server.addMenuItem("5", "Edit", actions.serversEdit);
    server.addMenuItem("6", "Cache", actions.serversCache);

    const open = root.addMenuItem("5", "Open");
    open.addMenuItem("1", "Terminal", actions.openTerminal);

    if (process.platform === "darwin") {
      open.addMenuItem("2", "Finder", actions.openFileSystem);
    } else if (process.platform === "win32") {
      open.addMenuItem("2", "Explorer", actions.openFileSystem);
    } else {
      open.addMenuItem("2", "File Manager", actions.openFileSystem);
    }

    open.addMenuItem("3", "System", actions.openSystem);

    const view = root.addMenuItem("6", "View");
    view.addMenuItem("1", "Refresh", actions.viewRefresh);
    view.addMenuItem("2", "Mirror", actions.viewMirror);
    view.addMenuItem("3", "Swap", actions.viewSwap);

    const compare = root.addMenuItem("7", "Compare");
    compare.addMenuItem("1", "Folders", actions.compareFolders);
    compare.addMenuItem("2", "Files", actions.compareFiles);

    return root;
  }

  showMenuItem(currentMenuItem) {
    this.currentMenuItem = currentMenuItem;
    this.content.empty();

    this.content.append($$(function() {
      return this.button({class: 'btn icon-arrow-up inline-block'});}));

    return (() => {
      const result = [];
      for (let id of Array.from(this.currentMenuItem.ids)) {
        var subMenuItem = this.currentMenuItem.getMenuItem(id);

        result.push(this.content.append($$(function() {
          return this.button(subMenuItem.title, {class: 'btn btn-primary inline-block'});})));
      }
      return result;
    })();
  }

  handleKeyDown(event) {
    const charCode = event.which | event.keyCode;

    if (event.shiftKey || (charCode === 27)) {
      return this.showParentMenuItem();
    }
  }

  handleKeyUp(event) {
    let charCode = event.which | event.keyCode;

    // Not sure if this the right way, but on OSX it allows the keypad to be used.
    if (charCode >= 96) {
      charCode -= 48;
    }

    const sCode = String.fromCharCode(charCode);

    if (sCode === "0") {
      return this.showParentMenuItem();
    } else {
      const subMenuItem = this.currentMenuItem.getMenuItem(sCode);
      return this.handleMenuItem(subMenuItem);
    }
  }

  handleMenuItem(menuItem) {
    if (menuItem) {
      if (menuItem.callback) {
        return menuItem.callback();
      } else {
        return this.showMenuItem(menuItem);
      }
    }
  }
});
