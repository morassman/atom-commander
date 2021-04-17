const etch = require('etch')

import { Disposable } from 'atom'
import { main } from '../../main'
import { Button, Div } from '../element-view'
import { MainView } from '../main-view'
import { Props, View } from '../view'
import { MenuItem } from './menu-item'

type MenuBarProps = Props & {

  mainView: MainView

}

type MenuBarRefs = {

  content: Div

  details: Div

}

interface DetailsRow {

  index: number

  description: string

  onClick: () => void

}

export class MenuBarView extends View<MenuBarProps, MenuBarRefs> {

  configDisposable: Disposable
  
  currentMenuItem: MenuItem
  
  rootMenuItem: MenuItem

  upButton: Button

  constructor(props: MenuBarProps) {
    super(props, false)
    this.addClass('atom-commander-menu-bar')

    this.upButton = new Button({className: 'btn icon-arrow-up inline-block', onClick: () => this.showParentMenuItem()})

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
    let fileManagerDescription = 'File manager - Show highlighted item in system file manager'

    if (process.platform === 'darwin') {
      fileManagerDescription = 'Finder - Show highlighted item in Finder'
    } else if (process.platform === 'win32') {
      fileManagerDescription = 'Explorer - Show highlighted item in Explorer'
    }

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
          {this.renderDetailsColumn('2 Go', [
            { index: 1, description: 'Project - Choose project folder to go to...', onClick: () => this.goProject()},
            { index: 2, description: 'Editor - Go to focused file in editor', onClick: () => this.goEditor()},
            { index: 3, description: 'Drive - Choose drive to go to...', onClick: () => this.goDrive()},
            { index: 4, description: 'Root - Go to current folder\'s root folder', onClick: () => this.goRoot()},
            { index: 5, description: 'Home - Go to user\'s home folder', onClick: () => this.goHome()}
          ])}
          {this.renderDetailsColumn('3 Bookmarks', [
            { index: 1, description: 'Add', onClick: () => this.bookmarksAdd()},
            { index: 2, description: 'Remove', onClick: () => this.bookmarksRemove()},
            { index: 3, description: 'Open', onClick: () => this.bookmarksOpen()}
          ])}
          {this.renderDetailsColumn('4 Servers', [
            { index: 1, description: 'Add', onClick: () => this.serversAdd()},
            { index: 2, description: 'Remove', onClick: () => this.serversRemove()},
            { index: 3, description: 'Open', onClick: () => this.serversOpen()},
            { index: 4, description: 'Close', onClick: () => this.serversClose()},
            { index: 5, description: 'Edit', onClick: () => this.serversEdit()},
            { index: 6, description: 'Cache - View cached files', onClick: () => this.serversCache()}
          ])}
          {this.renderDetailsColumn('5 Open', [
            { index: 1, description: 'Terminal - Open terminal in current folder', onClick: () => this.openTerminal()},
            { index: 2, description: fileManagerDescription, onClick: () => this.openFileManager()},
            { index: 3, description: 'System - Open highlighted item with system default', onClick: () => this.openSystem()}
          ])}
          {this.renderDetailsColumn('6 View', [
            { index: 1, description: 'Refresh - Refresh content of focused pane', onClick: () => this.viewRefresh()},
            { index: 2, description: 'Mirror - Show same content in other pane', onClick: () => this.viewMirror()},
            { index: 3, description: 'Swap - Swap content of two panes', onClick: () => this.viewSwap()}
          ])}
          {this.renderDetailsColumn('7 Compare', [
            { index: 1, description: 'Folders - Highlight difference between the two panes', onClick: () => this.compareFolders()},
            { index: 2, description: 'Files - Show difference between content of highlighted files', onClick: () => this.compareFiles()}
          ])}
        </div>
      </Div>
    </div>
  }

  initialize() {
    super.initialize()
    this.rootMenuItem = this.createRootMenuItem()
    this.showMenuItem(this.rootMenuItem)

    // TODO
    // const { buttonClicked } = this

    // this.content.on('click', 'button', function() {
    //   return buttonClicked($(this).text())
    // })

    this.configDisposable = atom.config.observe('atom-commander.menu.showMenuDetails', value => {
      if (value) {
        this.refs.details.show()
      } else {
        this.refs.details.hide()
      }
    })
  }

  dispose() {
    return this.configDisposable.dispose()
  }

  selectAll() { return main.actions.selectAll() }
  selectNone() { return main.actions.selectNone() }
  selectAdd() { return main.actions.selectAdd() }
  selectRemove() { return main.actions.selectRemove() }
  selectInvert() { return main.actions.selectInvert() }
  selectFolders() { return main.actions.selectFolders() }
  selectFiles() { return main.actions.selectFiles() }

  goProject() { return main.actions.goProject() }
  goEditor() { return main.actions.goEditor() }
  goDrive() { return main.actions.goDrive() }
  goRoot() { return main.actions.goRoot() }
  goHome() { return main.actions.goHome() }

  bookmarksAdd() { return main.actions.bookmarksAdd() }
  bookmarksRemove() { return main.actions.bookmarksRemove() }
  bookmarksOpen() { return main.actions.bookmarksOpen() }

  serversAdd() { return main.actions.serversAdd() }
  serversRemove() { return main.actions.serversRemove() }
  serversOpen() { return main.actions.serversOpen() }
  serversClose() { return main.actions.serversClose() }
  serversEdit() { return main.actions.serversEdit() }
  serversCache() { return main.actions.serversCache() }

  openTerminal() { return main.actions.openTerminal() }
  openFileManager() { return main.actions.openFileSystem() }
  openSystem() { return main.actions.openSystem() }

  viewRefresh() { return main.actions.viewRefresh() }
  viewMirror() { return main.actions.viewMirror() }
  viewSwap() { return main.actions.viewSwap() }

  compareFolders() { return main.actions.compareFolders() }
  compareFiles() { return main.actions.compareFiles() }

  settingsPressed() {
    this.props.mainView.hideMenuBar()
    atom.workspace.open('atom://config/packages/atom-commander')
  }

  showParentMenuItem() {
    if (this.currentMenuItem.parent === null) {
      this.props.mainView.hideMenuBar()
    } else {
      this.showMenuItem(this.currentMenuItem.parent)
    }
  }

  reset() {
    this.showMenuItem(this.rootMenuItem)
  }

  createRootMenuItem() {
    const { actions } = main
    const root = new MenuItem(null, '0', 'root')

    const select = root.addMenuItem('1', 'Select', () => this.showMenuItemWithId('1'))
    select.addMenuItem('1', 'All', () => actions.selectAll())
    select.addMenuItem('2', 'None', () => actions.selectNone())
    select.addMenuItem('3', 'Add', () => actions.selectAdd())
    select.addMenuItem('4', 'Remove', () => actions.selectRemove())
    select.addMenuItem('5', 'Invert', () => actions.selectInvert())
    select.addMenuItem('6', 'Folders', () => actions.selectFolders())
    select.addMenuItem('7', 'Files', () => actions.selectFiles())

    const go = root.addMenuItem('2', 'Go', () => this.showMenuItemWithId('2'))
    go.addMenuItem('1', 'Project', () => actions.goProject())
    go.addMenuItem('2', 'Editor', () => actions.goEditor())
    go.addMenuItem('3', 'Drive', () => actions.goDrive())
    go.addMenuItem('4', 'Root', () => actions.goRoot())
    go.addMenuItem('5', 'Home', () => actions.goHome())

    const bookmarks = root.addMenuItem('3', 'Bookmarks', () => this.showMenuItemWithId('3'))
    bookmarks.addMenuItem('1', 'Add', () => actions.bookmarksAdd())
    bookmarks.addMenuItem('2', 'Remove', () => actions.bookmarksRemove())
    bookmarks.addMenuItem('3', 'Open', () => actions.bookmarksOpen())

    const server = root.addMenuItem('4', 'Servers', () => this.showMenuItemWithId('4'))
    server.addMenuItem('1', 'Add', () => actions.serversAdd())
    server.addMenuItem('2', 'Remove', () => actions.serversRemove())
    server.addMenuItem('3', 'Open', () => actions.serversOpen())
    server.addMenuItem('4', 'Close', () => actions.serversClose())
    server.addMenuItem('5', 'Edit', () => actions.serversEdit())
    server.addMenuItem('6', 'Cache', () => actions.serversCache())

    const open = root.addMenuItem('5', 'Open', () => this.showMenuItemWithId('5'))
    open.addMenuItem('1', 'Terminal', () => actions.openTerminal())

    if (process.platform === 'darwin') {
      open.addMenuItem('2', 'Finder', () => actions.openFileSystem())
    } else if (process.platform === 'win32') {
      open.addMenuItem('2', 'Explorer', () => actions.openFileSystem())
    } else {
      open.addMenuItem('2', 'File Manager', () => actions.openFileSystem())
    }

    open.addMenuItem('3', 'System', () => actions.openSystem)

    const view = root.addMenuItem('6', 'View', () => this.showMenuItemWithId('6'))
    view.addMenuItem('1', 'Refresh', () => actions.viewRefresh())
    view.addMenuItem('2', 'Mirror', () => actions.viewMirror())
    view.addMenuItem('3', 'Swap', () => actions.viewSwap())

    const compare = root.addMenuItem('7', 'Compare', () => this.showMenuItemWithId('7'))
    compare.addMenuItem('1', 'Folders', () => actions.compareFolders())
    compare.addMenuItem('2', 'Files', () => actions.compareFiles())

    return root
  }

  showMenuItemWithId(id: string) {
    const menuItem = this.currentMenuItem.getMenuItem(id)

    if (menuItem) {
      this.showMenuItem(menuItem)
    }
  }

  showMenuItem(currentMenuItem: MenuItem) {
    this.currentMenuItem = currentMenuItem
    this.refs.content.clear()

    this.refs.content.append(this.upButton)

    this.currentMenuItem.ids.forEach(id => {
      const subMenuItem = this.currentMenuItem.getMenuItem(id)

      if (subMenuItem) {
        this.refs.content.append(subMenuItem)
      }
    })
  }

  handleKeyDown(event: KeyboardEvent) {
    const charCode = event.which | event.keyCode

    if (event.shiftKey || (charCode === 27)) {
      this.showParentMenuItem()
    }
  }

  handleKeyUp(event: KeyboardEvent) {
    let charCode = event.which | event.keyCode

    // Not sure if this the right way, but on OSX it allows the keypad to be used.
    if (charCode >= 96) {
      charCode -= 48
    }

    const sCode = String.fromCharCode(charCode)

    if (sCode === '0') {
      this.showParentMenuItem()
    } else {
      const menuItem = this.currentMenuItem.getMenuItem(sCode)

      if (menuItem) {
        menuItem.onClick()
      }
      // this.showMenuItemWithId(sCode)
    }
  }

}
