const etch = require('etch')

import { CompositeDisposable } from 'atom';
import { main } from '../../main'
import { Div } from '../element-view';
import { MainView } from '../main-view';
import { Props, View } from '../view'
import { MenuItem } from './menu-item';

type MenuBarRefs = {

  mainView: MainView

  content: Div

}

interface DetailsRow {

  index: number

  description: string

  onClick: () => void

}

export class MenuBarView extends View<Props, MenuBarRefs> {

  configDisposable: CompositeDisposable
  
  currentMenuItem: MenuItem
  
  rootMenuItem: MenuItem

  constructor() {
    super({}, false)
    this.addClass('atom-commander-menu-bar')
    this.initialize()
  }

  renderDetailsRow(row: DetailsRow) {
    return  <div className='item' onClick={row.onClick}>
      <div>{`${row.index}`}</div>
      <div className='description'>{row.description}</div>
    </div>
  }

  renderDetailsColumn(title: string, rows: DetailsRow[]) {
    return <div className='column'>
      <div className='title'>{title}</div>
      <div className='body'>
        {rows.map(row => this.renderDetailsRow(row))}
      </div>
    </div>
  }

  render() {
    return <div {...this.getProps()}>
      <Div ref='content' className='buttons'/>
      <div className='extra-buttons'>
        <button className='btn btn-sm inline-block icon-gear' attributes={{tabindex: -1}} onClick={() => this.settingsPressed()}/>
      </div>
      <Div ref='details'>
        <div className='details'>
          {this.renderDetailsColumn('1 Select', [
            { index: 1, description: 'All', onClick: () => this.selectAll()},
            { index: 2, description: 'None', onClick: () => this.selectNone()},
            { index: 3, description: 'Add to selection...', onClick: () => this.selectAdd()},
            { index: 4, description: 'Remove from selection...', onClick: () => this.selectRemove()},
            { index: 5, description: 'Invert selection', onClick: () => this.selectInvert()},
            { index: 6, description: 'Folders', onClick: () => this.selectFolders()},
            { index: 7, description: 'Files', onClick: () => this.selectFiles()}
          ])}
        </div>
      </Div>
    </div>
  }

  // static content() {
  //   return this.div({class: 'atom-commander-menu-bar'}, () => {
  //     this.div({class: 'buttons', outlet: 'content'});
  //     this.div({class: 'extra-buttons'}, () => {
  //       return this.button({tabindex: -1, class: 'btn btn-sm inline-block icon-gear', click: 'settingsPressed'});
  //   });
  //     return this.div({outlet: 'details'}, () => {
  //       return this.div({class: 'details'}, () => {
  //         this.div({class: 'column'}, () => {
  //           this.div('1 Select', {class: 'title'});
  //           return this.div({class: 'body'}, () => {
  //             this.div({class: 'item', click: 'selectAll'}, () => {
  //               this.div('1');
  //               return this.div('All', {class: 'description'});
  //           });
  //             this.div({class: 'item', click: 'selectNone'}, () => {
  //               this.div('2');
  //               return this.div('None', {class: 'description'});
  //           });
  //             this.div({class: 'item', click: 'selectAdd'}, () => {
  //               this.div('3');
  //               return this.div('Add to selection...', {class: 'description'});
  //           });
  //             this.div({class: 'item', click: 'selectRemove'}, () => {
  //               this.div('4');
  //               return this.div('Remove from selection...', {class: 'description'});
  //           });
  //             this.div({class: 'item', click: 'selectInvert'}, () => {
  //               this.div('5');
  //               return this.div('Invert selection', {class: 'description'});
  //           });
  //             this.div({class: 'item', click: 'selectFolders'}, () => {
  //               this.div('6');
  //               return this.div('Folders', {class: 'description'});
  //           });
  //             return this.div({class: 'item', click: 'selectFiles'}, () => {
  //               this.div('7');
  //               return this.div('Files', {class: 'description'});
  //           });
  //         });
  //       });
  //         this.div({class: 'column'}, () => {
  //           this.div('2 Go', {class: 'title'});
  //           return this.div({class: 'body'}, () => {
  //             this.div({class: 'item', click: 'goProject'}, () => {
  //               this.div('1');
  //               return this.div('Project - Choose project folder to go to...', {class: 'description'});
  //           });
  //             this.div({class: 'item', click: 'goEditor'}, () => {
  //               this.div('2');
  //               return this.div('Editor - Go to focused file in editor', {class: 'description'});
  //           });
  //             this.div({class: 'item', click: 'goDrive'}, () => {
  //               this.div('3');
  //               return this.div('Drive - Choose drive to go to...', {class: 'description'});
  //           });
  //             this.div({class: 'item', click: 'goRoot'}, () => {
  //               this.div('4');
  //               return this.div('Root - Go to current folder\'s root folder', {class: 'description'});
  //           });
  //             return this.div({class: 'item', click: 'goHome'}, () => {
  //               this.div('5');
  //               return this.div('Home - Go to user\'s home folder', {class: 'description'});
  //           });
  //         });
  //       });
  //         this.div({class: 'column'}, () => {
  //           this.div('3 Bookmarks', {class: 'title'});
  //           return this.div({class: 'body'}, () => {
  //             this.div({class: 'item', click: 'bookmarksAdd'}, () => {
  //               this.div('1');
  //               return this.div('Add', {class: 'description'});
  //           });
  //             this.div({class: 'item', click: 'bookmarksRemove'}, () => {
  //               this.div('2');
  //               return this.div('Remove', {class: 'description'});
  //           });
  //             return this.div({class: 'item', click: 'bookmarksOpen'}, () => {
  //               this.div('3');
  //               return this.div('Open', {class: 'description'});
  //           });
  //         });
  //       });
  //         this.div({class: 'column'}, () => {
  //           this.div('4 Servers', {class: 'title'});
  //           return this.div({class: 'body'}, () => {
  //             this.div({class: 'item', click: 'serversAdd'}, () => {
  //               this.div('1');
  //               return this.div('Add', {class: 'description'});
  //           });
  //             this.div({class: 'item', click: 'serversRemove'}, () => {
  //               this.div('2');
  //               return this.div('Remove', {class: 'description'});
  //           });
  //             this.div({class: 'item', click: 'serversOpen'}, () => {
  //               this.div('3');
  //               return this.div('Open', {class: 'description'});
  //           });
  //             this.div({class: 'item', click: 'serversClose'}, () => {
  //               this.div('4');
  //               return this.div('Close', {class: 'description'});
  //           });
  //             this.div({class: 'item', click: 'serversEdit'}, () => {
  //               this.div('5');
  //               return this.div('Edit', {class: 'description'});
  //           });
  //             return this.div({class: 'item', click: 'serversCache'}, () => {
  //               this.div('6');
  //               return this.div('Cache - View cached files', {class: 'description'});
  //           });
  //         });
  //       });
  //         this.div({class: 'column'}, () => {
  //           this.div('5 Open', {class: 'title'});
  //           return this.div({class: 'body'}, () => {
  //             this.div({class: 'item', click: 'openTerminal'}, () => {
  //               this.div('1');
  //               return this.div('Terminal - Open terminal in current folder', {class: 'description'});
  //           });
  //             this.div({class: 'item', click: 'openFileManager'}, () => {
  //               this.div('2');
  //               return this.div('File manager - Show highlighted item in system file manager', {class: 'description', outlet: 'fileManagerItem'});
  //           });
  //             return this.div({class: 'item', click: 'openSystem'}, () => {
  //               this.div('3');
  //               return this.div('System - Open highlighted item with system default', {class: 'description'});
  //           });
  //         });
  //       });
  //         this.div({class: 'column'}, () => {
  //           this.div('6 View', {class: 'title'});
  //           return this.div({class: 'body'}, () => {
  //             this.div({class: 'item', click: 'viewRefresh'}, () => {
  //               this.div('1');
  //               return this.div('Refresh - Refresh content of focused pane', {class: 'description'});
  //           });
  //             this.div({class: 'item', click: 'viewMirror'}, () => {
  //               this.div('2');
  //               return this.div('Mirror - Show same content in other pane', {class: 'description'});
  //           });
  //             return this.div({class: 'item', click: 'viewSwap'}, () => {
  //               this.div('3');
  //               return this.div('Swap - Swap content of two panes', {class: 'description'});
  //           });
  //         });
  //       });
  //         return this.div({class: 'column'}, () => {
  //           this.div('7 Compare', {class: 'title'});
  //           return this.div({class: 'body'}, () => {
  //             this.div({class: 'item', click: 'compareFolders'}, () => {
  //               this.div('1');
  //               return this.div('Folders - Highlight difference between the two panes', {class: 'description'});
  //           });
  //             return this.div({class: 'item', click: 'compareFiles'}, () => {
  //               this.div('2');
  //               return this.div('Files - Show difference between content of highlighted files', {class: 'description'});
  //           });
  //         });
  //       });
  //     });
  //   });
  // });
  // }

  dispose() {
    return this.configDisposable.dispose();
  }

  selectAll() { return main.actions.selectAll(); }
  selectNone() { return main.actions.selectNone(); }
  selectAdd() { return main.actions.selectAdd(); }
  selectRemove() { return main.actions.selectRemove(); }
  selectInvert() { return main.actions.selectInvert(); }
  selectFolders() { return main.actions.selectFolders(); }
  selectFiles() { return main.actions.selectFiles(); }

  goProject() { return main.actions.goProject(); }
  goEditor() { return main.actions.goEditor(); }
  goDrive() { return main.actions.goDrive(); }
  goRoot() { return main.actions.goRoot(); }
  goHome() { return main.actions.goHome(); }

  bookmarksAdd() { return main.actions.bookmarksAdd(); }
  bookmarksRemove() { return main.actions.bookmarksRemove(); }
  bookmarksOpen() { return main.actions.bookmarksOpen(); }

  serversAdd() { return main.actions.serversAdd(); }
  serversRemove() { return main.actions.serversRemove(); }
  serversOpen() { return main.actions.serversOpen(); }
  serversClose() { return main.actions.serversClose(); }
  serversEdit() { return main.actions.serversEdit(); }
  serversCache() { return main.actions.serversCache(); }

  openTerminal() { return main.actions.openTerminal(); }
  openFileManager() { return main.actions.openFileSystem(); }
  openSystem() { return main.actions.openSystem(); }

  viewRefresh() { return main.actions.viewRefresh(); }
  viewMirror() { return main.actions.viewMirror(); }
  viewSwap() { return main.actions.viewSwap(); }

  compareFolders() { return main.actions.compareFolders(); }
  compareFiles() { return main.actions.compareFiles(); }

  // setMainView(mainView: MainView) {
  //   this.mainView = mainView;
  //   this.rootMenuItem = this.createRootMenuItem();
  //   this.showMenuItem(this.rootMenuItem);

  //   const {
  //     buttonClicked
  //   } = this;

  //   this.content.on('click', 'button', function() {
  //     return buttonClicked($(this).text());
  //   });

  //   if (process.platform === "darwin") {
  //     this.fileManagerItem.text('Finder - Show highlighted item in Finder');
  //   } else if (process.platform === "win32") {
  //     this.fileManagerItem.text('Explorer - Show highlighted item in Explorer');
  //   }

  //   return this.configDisposable = atom.config.observe('atom-commander.menu.showMenuDetails', value => {
  //     if (value) {
  //       return this.details.show();
  //     } else {
  //       return this.details.hide();
  //     }
  //   });
  // }

  settingsPressed() {
    this.refs.mainView.hideMenuBar();
    atom.workspace.open('atom://config/packages/atom-commander');
  }

  buttonClicked(title: string) {
    if (title === "") {
      this.showParentMenuItem();
    } else if (this.currentMenuItem) {
      this.handleMenuItem(this.currentMenuItem.getMenuItemWithTitle(title));
    }
  }

  showParentMenuItem() {
    if (this.currentMenuItem.parent === null) {
      return this.refs.mainView.hideMenuBar();
    } else {
      return this.handleMenuItem(this.currentMenuItem.parent);
    }
  }

  reset() {
    return this.showMenuItem(this.rootMenuItem);
  }

  // createRootMenuItem() {
  //   const {
  //     actions
  //   } = main;
  //   const root = new MenuItem(null, "0", "root");

  //   const select = root.addMenuItem("1", "Select");
  //   select.addMenuItem("1", "All", actions.selectAll);
  //   select.addMenuItem("2", "None", actions.selectNone);
  //   select.addMenuItem("3", "Add", actions.selectAdd);
  //   select.addMenuItem("4", "Remove", actions.selectRemove);
  //   select.addMenuItem("5", "Invert", actions.selectInvert);
  //   select.addMenuItem("6", "Folders", actions.selectFolders);
  //   select.addMenuItem("7", "Files", actions.selectFiles);

  //   const go = root.addMenuItem("2", "Go");
  //   go.addMenuItem("1", "Project", actions.goProject);
  //   go.addMenuItem("2", "Editor", actions.goEditor);
  //   go.addMenuItem("3", "Drive", actions.goDrive);
  //   go.addMenuItem("4", "Root", actions.goRoot);
  //   go.addMenuItem("5", "Home", actions.goHome);

  //   const bookmarks = root.addMenuItem("3", "Bookmarks");
  //   bookmarks.addMenuItem("1", "Add", actions.bookmarksAdd);
  //   bookmarks.addMenuItem("2", "Remove", actions.bookmarksRemove);
  //   bookmarks.addMenuItem("3", "Open", actions.bookmarksOpen);

  //   const server = root.addMenuItem("4", "Servers");
  //   server.addMenuItem("1", "Add", actions.serversAdd);
  //   server.addMenuItem("2", "Remove", actions.serversRemove);
  //   server.addMenuItem("3", "Open", actions.serversOpen);
  //   server.addMenuItem("4", "Close", actions.serversClose);
  //   server.addMenuItem("5", "Edit", actions.serversEdit);
  //   server.addMenuItem("6", "Cache", actions.serversCache);

  //   const open = root.addMenuItem("5", "Open");
  //   open.addMenuItem("1", "Terminal", actions.openTerminal);

  //   if (process.platform === "darwin") {
  //     open.addMenuItem("2", "Finder", actions.openFileSystem);
  //   } else if (process.platform === "win32") {
  //     open.addMenuItem("2", "Explorer", actions.openFileSystem);
  //   } else {
  //     open.addMenuItem("2", "File Manager", actions.openFileSystem);
  //   }

  //   open.addMenuItem("3", "System", actions.openSystem);

  //   const view = root.addMenuItem("6", "View");
  //   view.addMenuItem("1", "Refresh", actions.viewRefresh);
  //   view.addMenuItem("2", "Mirror", actions.viewMirror);
  //   view.addMenuItem("3", "Swap", actions.viewSwap);

  //   const compare = root.addMenuItem("7", "Compare");
  //   compare.addMenuItem("1", "Folders", actions.compareFolders);
  //   compare.addMenuItem("2", "Files", actions.compareFiles);

  //   return root;
  // }

  showMenuItem(currentMenuItem: MenuItem) {
    this.currentMenuItem = currentMenuItem;
    // TODO
    // this.content.empty();

    // this.content.append($$(function() {
    //   return this.button({class: 'btn icon-arrow-up inline-block'});}));

    // return (() => {
    //   const result = [];
    //   for (let id of Array.from(this.currentMenuItem.ids)) {
    //     var subMenuItem = this.currentMenuItem.getMenuItem(id);

    //     result.push(this.content.append($$(function() {
    //       return this.button(subMenuItem.title, {class: 'btn btn-primary inline-block'});})));
    //   }
    //   return result;
    // })();
  }

  handleKeyDown(event: KeyboardEvent) {
    const charCode = event.which | event.keyCode;

    if (event.shiftKey || (charCode === 27)) {
      this.showParentMenuItem();
    }
  }

  handleKeyUp(event: KeyboardEvent) {
    let charCode = event.which | event.keyCode;

    // Not sure if this the right way, but on OSX it allows the keypad to be used.
    if (charCode >= 96) {
      charCode -= 48;
    }

    const sCode = String.fromCharCode(charCode);

    if (sCode === "0") {
      this.showParentMenuItem();
    } else {
      const subMenuItem = this.currentMenuItem.getMenuItem(sCode);
      this.handleMenuItem(subMenuItem);
    }
  }

  handleMenuItem(menuItem: MenuItem | null) {
    if (menuItem) {
      if (menuItem.callback) {
        menuItem.callback();
      } else {
        this.showMenuItem(menuItem);
      }
    }
  }
}
