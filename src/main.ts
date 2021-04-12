import { CompositeDisposable, Directory, Dock, File, Panel } from 'atom'
import { Bookmark } from './bookmark-manager'
import { LocalFileSystem } from './fs/local'
import { VFileSystem } from './fs/vfilesystem'
import { Actions } from './actions'
import { Schemas } from './schemas'
import { BookmarkManager } from './bookmark-manager'
// import { ServerManager } from './servers/server-manager'
// import { RemoteConfig } from './fs/ftp/remote-config'
// import { Server } from './servers/server'

import * as fsp from 'fs-plus'
import { MainView, ATOM_COMMANDER_URI } from './views/main-view'

// const ListView = require('./views/list-view')
// const DiffView = require('./views/diff/diff-view')
// const StatusView = require('./views/status-view')

// const fsp = require('fsp')

export interface State {

  bookmarks?: Bookmark[]

  // servers?: RemoteConfig[]

  visible?: boolean

  version?: number

  sizeColumnVisible: boolean

  dateColumnVisible: boolean

  extensionColumnVisible: boolean

  left?: any

  right?: any

  height?: number

}


export class Main {

  state: State

  bookmarks: Bookmark[]

  localFileSystem: LocalFileSystem

  actions: Actions

  bookmarkManager: BookmarkManager

  // serverManager: ServerManager

  subscriptions: CompositeDisposable

  bottomPanel: Panel<any>

  mainView: MainView

  element: any

  sizeColumnVisible: boolean
  
  dateColumnVisible: boolean
  
  extensionColumnVisible: boolean

  activate(state: State) {
    this.state = state
    this.loadState()
    this.bookmarks = []

    this.localFileSystem = new LocalFileSystem()
    this.actions = new Actions(this)
    this.bookmarkManager = new BookmarkManager(this, this.state.bookmarks)
    // this.serverManager = new ServerManager(this, this.state.servers)
    // this.mainView = new MainView(this, state)
    // @element = @mainView.getElement()

    this.subscriptions = new CompositeDisposable()

    this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:toggle-visible': () => this.toggle() }))
    this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:toggle-focus': () => this.toggleFocus() }))

    // this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:select-all': () => this.actions.selectAll() }))
    // this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:select-none': () => this.actions.selectNone() }))
    // this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:select-add': () => this.actions.selectAdd() }))
    // this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:select-remove': () => this.actions.selectRemove() }))
    // this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:select-invert': () => this.actions.selectInvert() }))
    // this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:select-folders': () => this.actions.selectFolders() }))
    // this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:select-files': () => this.actions.selectFiles() }))

    // this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:refresh-view': () => this.actions.viewRefresh() }))
    // this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:mirror-view': () => this.actions.viewMirror() }))
    // this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:swap-view': () => this.actions.viewSwap() }))

    // this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:compare-folders': () => this.actions.compareFolders() }))
    // this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:compare-files': () => this.actions.compareFiles() }))

    // this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:go-project': () => this.actions.goProject() }))
    // this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:go-editor': () => this.actions.goEditor() }))
    // this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:go-drive': () => this.actions.goDrive() }))
    // this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:go-root': () => this.actions.goRoot() }))
    // this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:go-home': () => this.actions.goHome() }))

    // this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:add-bookmark': () => this.actions.bookmarksAdd(false) }))
    // this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:remove-bookmark': () => this.actions.bookmarksRemove(false) }))
    // this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:open-bookmark': () => this.actions.bookmarksOpen(false) }))

    // this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:add-server': () => this.actions.serversAdd(false) }))
    // this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:remove-server': () => this.actions.serversRemove(false) }))
    // this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:open-server': () => this.actions.serversOpen(false) }))
    // this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:close-server': () => this.actions.serversClose(false) }))
    // this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:edit-server': () => this.actions.serversEdit(false) }))
    // this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:open-cache': () => this.actions.serversCache(false) }))

    // this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:open-terminal': () => this.actions.openTerminal() }))
    // this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:show-in-file-manager': () => this.actions.openFileSystem() }))
    // this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:open-with-system': () => this.actions.openSystem() }))

    // this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:toggle-size-column': () => this.actions.toggleSizeColumn() }))
    // this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:toggle-date-column': () => this.actions.toggleDateColumn() }))
    // this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:toggle-extension-column': () => this.actions.toggleExtensionColumn() }))

    // this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:sort-by-name': () => this.actions.sortByName() }))
    // this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:sort-by-extension': () => this.actions.sortByExtension() }))
    // this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:sort-by-size': () => this.actions.sortBySize() }))
    // this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:sort-by-date': () => this.actions.sortByDate() }))
    // this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:sort-by-default': () => this.actions.sortByDefault() }))

    // this.subscriptions.add(atom.commands.add('atom-text-editor', {
    //   'atom-commander:upload-file': event => {
    //     event.stopPropagation()
    //     return this.actions.uploadFile()
    //   }
    // }))

    // this.subscriptions.add(atom.commands.add('atom-text-editor', {
    //   'atom-commander:download-file': event => {
    //     event.stopPropagation()
    //     return this.actions.downloadFile()
    //   }
    // }))

    // this.subscriptions.add(atom.commands.add('atom-text-editor', {
    //   'atom-commander:compare-with-server': event => {
    //     event.stopPropagation()
    //     return this.actions.compareWithServer()
    //   }
    // })

    // this.subscriptions.add(atom.commands.add('atom-text-editor', {
    //   'atom-commander:add-bookmark': event => {
    //     event.stopPropagation()
    //     return this.actions.bookmarksAddEditor()
    //   }
    // }
    // )
    // )

    // // Monitor active pane item in docks.
    // this.subscriptions.add(atom.workspace.getLeftDock().onDidChangeActivePaneItem(event => {
    //   this.onDidChangeActivePaneItem(event)
    // })
    // )

    // this.subscriptions.add(atom.workspace.getRightDock().onDidChangeActivePaneItem(event => {
    //   this.onDidChangeActivePaneItem(event)
    // })
    // )

    // this.subscriptions.add(atom.workspace.getBottomDock().onDidChangeActivePaneItem(event => {
    //   this.onDidChangeActivePaneItem(event)
    // })
    // )

    // this.subscriptions.add(atom.workspace.getLeftDock().onWillDestroyPaneItem(event => {
    //   this.onWillDestroyPaneItem(event)
    // })
    // )

    // this.subscriptions.add(atom.workspace.getRightDock().onWillDestroyPaneItem(event => {
    //   this.onWillDestroyPaneItem(event)
    // })
    // )

    // this.subscriptions.add(atom.workspace.getBottomDock().onWillDestroyPaneItem(event => {
    //   this.onWillDestroyPaneItem(event)
    // })
    // )

    // // Monitor configuration
    // this.subscriptions.add(atom.config.onDidChange('atom-commander.panel.onlyOneWhenVertical', () => {
    //   return (this.mainView != null ? this.mainView.applyVisibility() : undefined)
    // })
    // )

    // if (this.state.visible) {
    //   return this.show(false)
    // }
  }

  getMainView(createLazy: boolean = false): MainView {
    if (!this.mainView && createLazy) {
      this.mainView = new MainView(this, this.state)
      this.element = this.mainView.element
    }

    return this.mainView
  }

  getActions() {
    return this.actions
  }

  getLocalFileSystem() {
    return this.localFileSystem
  }

  getBookmarkManager() {
    return this.bookmarkManager
  }

  // getServerManager() {
  //   return this.serverManager
  // }

  getSaveFile() {
    const configFile = new File(atom.config.getUserConfigPath())
    const directory = configFile.getParent()
    return directory.getFile('atom-commander.json')
  }

  loadState() {
    if ((this.state == null)) {
      this.state = Schemas.newState()
    }

    const file = this.getSaveFile()

    if (!file.existsSync()) {
      return
    }

    try {
      this.state = JSON.parse(fsp.readFileSync(file.getPath()).toString())
      return this.state = Schemas.upgrade(this.state)
    } catch (error) {
      console.log('Error loading Atom Commander state.')
      return console.log(error)
    }
  }

  saveState() {
    const state = this.serialize()
    const file = this.getSaveFile()

    try {
      return fsp.writeFileSync(file.getPath(), JSON.stringify(state))
    } catch (error) {
      console.log('Error saving Atom Commander state.')
      return console.log(error)
    }
  }

  deactivate() {
    this.saveState()

    this.subscriptions.dispose()
    // this.serverManager.dispose()

    if (this.mainView) {
      this.mainView.destroy()
    }

    if (this.bottomPanel) {
      this.bottomPanel.destroy()
    }

    // if (this.statusTile) {
    //   this.statusTile.destroy()
    // }
  }

  serialize() {
    let state: State = {
      sizeColumnVisible: this.sizeColumnVisible,
      dateColumnVisible: this.dateColumnVisible,
      extensionColumnVisible: this.extensionColumnVisible,
      visible: this.isVisible(),
      bookmarks: this.bookmarkManager.serialize(),
      // servers: this.serverManager.serialize(),
      version: 4
    }

    // if (this.mainView) {
    //   this.mainView.serialize(state)
    // }

    return state
  }

  onWillDestroyPaneItem(event: any) {
    // if (event.item === this.mainView) {
    //   this.state.visible = false
    //   this.saveState()
    //   this.mainView.destroy()
    //   return this.mainView = null
    // }
  }

  onDidChangeActivePaneItem(item: any) {
    // if (item !== this.mainView) {
    //   return
    // }

    // const dock = this.getDock()

    // if (dock != null) {
    //   return this.getMainView().setHorizontal(dock.location === 'bottom')
    // }
  }

  getDock(): Dock | null {
    if (atom.workspace.getBottomDock().getPaneItems().indexOf(this.mainView) >= 0) {
      return atom.workspace.getBottomDock()
    }
    if (atom.workspace.getLeftDock().getPaneItems().indexOf(this.mainView) >= 0) {
      return atom.workspace.getLeftDock()
    }
    if (atom.workspace.getRightDock().getPaneItems().indexOf(this.mainView) >= 0) {
      return atom.workspace.getRightDock()
    }

    return null
  }

  isVisible() {
    if (this.bottomPanel) {
      return this.state.visible
    } else {
      return this.isVisibleInDock()
    }
  }

  isVisibleInDock() {
    const dock = this.getDock()

    if ((dock == null) || !dock.isVisible()) {
      return false
    }

    if ((dock.getActivePane() == null)) {
      return false
    }

    return dock.getActivePane().getActiveItem() === this.mainView
  }

  toggle() {
    if (this.isVisible()) {
      return this.hide()
    } else {
      return this.show(false)
    }
  }

  togglePanelVisible() {
    if (this.bottomPanel.isVisible()) {
      this.unfocus()
      return this.bottomPanel.hide()
    } else {
      return this.bottomPanel.show()
    }
  }

  show(focus: boolean, location?: any) {
    if (this.bottomPanel) {
      this.showPanel(focus)
    } else {
      this.showDock(focus, location)
    }

    this.state.visible = true
    return this.saveState()
  }

  showPanel(focus: boolean) {
    this.bottomPanel.show()

    if (focus) {
      return this.focus()
    }
  }

  showDock(focus: boolean, location: any) {
    let paneContainer: Dock | undefined = atom.workspace.paneContainerForURI(ATOM_COMMANDER_URI) as Dock

    if (paneContainer) {
      paneContainer.show()

      if (focus) {
        return this.focus()
      }
    } else {
      return atom.workspace.open(this.getMainView(true), {
        searchAllPanes: true,
        activatePane: true,
        activateItem: true,
        location
      }).then(() => {
        paneContainer = atom.workspace.paneContainerForURI(ATOM_COMMANDER_URI) as Dock

        if (paneContainer) {
          paneContainer.show()

          if (focus) {
            return this.focus()
          }
        }
      })
    }
  }

  hide() {
    if (this.bottomPanel != null) {
      this.bottomPanel.hide()
    } else if (this.mainView != null) {
      atom.workspace.hide(this.mainView)
    }

    this.state.visible = false
    return this.saveState()
  }

  focus() {
    // const mainView = this.getMainView()

    // if (mainView) {
    //   mainView.refocusLastView()
    // }
  }

  unfocus() {
    // TODO    
    // return atom.workspace.getCenter().activate()
  }

  hasFocus() {
    // if ((this.mainView == null)) {
    //   return false
    // }

    // return (this.mainView.focusedView !== null) && this.mainView.focusedView.hasFocus()
  }

  toggleFocus() {
    // if (this.hasFocus()) {
    //   return this.unfocus()
    // } else {
    //   return this.show(true)
    // }
  }

  consumeStatusBar(statusBar: any) {
    // this.statusView = new StatusView()
    // return this.statusTile = statusBar.addRightTile({ item: this.statusView })
  }

  refreshStatus() {
    // if (this.statusView === null) {
    //   return
    // }

    // this.statusView.setUploadCount(this.serverManager.getUploadCount())
    // return this.statusView.setDownloadCount(this.serverManager.getDownloadCount())
  }

  fileSystemRemoved(fileSystem: VFileSystem) {
    // this.bookmarkManager.fileSystemRemoved(fileSystem)
    // return (this.mainView != null ? this.mainView.fileSystemRemoved(fileSystem) : undefined)
  }

  // serverClosed(server: Server) {
  //   return (this.mainView != null ? this.mainView.serverClosed(server) : undefined)
  // }

  // getFileSystemWithID(fileSystemId: string) {
  //   if (this.localFileSystem.getID() === fileSystemId) {
  //     return this.localFileSystem
  //   }

  //   return this.serverManager.getFileSystemWithID(fileSystemId)
  // }
}

export const main = new Main()
