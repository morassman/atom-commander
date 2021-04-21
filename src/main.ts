import { CompositeDisposable, Directory, Dock, File, PaneItemObservedEvent, Panel } from 'atom'
import { Bookmark } from './bookmark-manager'
import { LocalFileSystem } from './fs/local'
import { VFileSystem } from './fs/vfilesystem'
import { Actions } from './actions'
import { Schemas } from './schemas'
import { BookmarkManager } from './bookmark-manager'
import { ServerManager } from './servers/server-manager'
import { RemoteConfig } from './fs/ftp/remote-config'
import { Server } from './servers/server'

import * as fsp from 'fs-plus'
import { MainView, ATOM_COMMANDER_URI } from './views/main-view'
import { ContainerState } from './views/container-view'

// const ListView = require('./views/list-view')
// const DiffView = require('./views/diff/diff-view')
// const StatusView = require('./views/status-view')

// const fsp = require('fsp')

export interface SideState {
 
  tabs: ContainerState[]

  selectedTab?: number

}

export interface State {

  version: number

  bookmarks?: Bookmark[]

  servers?: RemoteConfig[]

  visible?: boolean

  sizeColumnVisible?: boolean

  dateColumnVisible?: boolean

  extensionColumnVisible?: boolean

  leftPath?: string

  rightPath?: string

  left?: SideState

  right?: SideState

  height?: number

}

function newState(): State {
  return {
    version: 4
  }
}

export class Main {

  state: State

  bookmarks: Bookmark[]

  localFileSystem: LocalFileSystem

  actions: Actions

  bookmarkManager: BookmarkManager

  serverManager: ServerManager

  subscriptions: CompositeDisposable

  mainView: MainView

  element: HTMLElement

  sizeColumnVisible: boolean
  
  dateColumnVisible: boolean
  
  extensionColumnVisible: boolean

  activate(state: State) {
    this.state = state || newState()
    this.loadState()
    this.bookmarks = []

    this.localFileSystem = new LocalFileSystem()
    this.actions = new Actions(this)
    this.bookmarkManager = new BookmarkManager(this, this.state.bookmarks)
    this.serverManager = new ServerManager(this, this.state.servers)

    this.subscriptions = new CompositeDisposable()

    this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:toggle-visible': () => this.toggle() }))
    this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:toggle-focus': () => this.toggleFocus() }))

    this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:select-all': () => this.actions.selectAll() }))
    this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:select-none': () => this.actions.selectNone() }))
    this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:select-add': () => this.actions.selectAdd() }))
    this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:select-remove': () => this.actions.selectRemove() }))
    this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:select-invert': () => this.actions.selectInvert() }))
    this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:select-folders': () => this.actions.selectFolders() }))
    this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:select-files': () => this.actions.selectFiles() }))

    this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:refresh-view': () => this.actions.viewRefresh() }))
    this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:mirror-view': () => this.actions.viewMirror() }))
    this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:swap-view': () => this.actions.viewSwap() }))

    this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:compare-folders': () => this.actions.compareFolders() }))
    this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:compare-files': () => this.actions.compareFiles() }))

    this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:go-project': () => this.actions.goProject() }))
    this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:go-editor': () => this.actions.goEditor() }))
    this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:go-drive': () => this.actions.goDrive() }))
    this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:go-root': () => this.actions.goRoot() }))
    this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:go-home': () => this.actions.goHome() }))

    this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:add-bookmark': () => this.actions.bookmarksAdd(false) }))
    this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:remove-bookmark': () => this.actions.bookmarksRemove(false) }))
    this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:open-bookmark': () => this.actions.bookmarksOpen(false) }))

    this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:add-server': () => this.actions.serversAdd(false) }))
    this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:remove-server': () => this.actions.serversRemove(false) }))
    this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:open-server': () => this.actions.serversOpen(false) }))
    this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:close-server': () => this.actions.serversClose(false) }))
    this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:edit-server': () => this.actions.serversEdit(false) }))
    this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:open-cache': () => this.actions.serversCache(false) }))

    this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:open-terminal': () => this.actions.openTerminal() }))
    this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:show-in-file-manager': () => this.actions.openFileSystem() }))
    this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:open-with-system': () => this.actions.openSystem() }))

    this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:toggle-size-column': () => this.actions.toggleSizeColumn() }))
    this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:toggle-date-column': () => this.actions.toggleDateColumn() }))
    this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:toggle-extension-column': () => this.actions.toggleExtensionColumn() }))

    this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:sort-by-name': () => this.actions.sortByName() }))
    this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:sort-by-extension': () => this.actions.sortByExtension() }))
    this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:sort-by-size': () => this.actions.sortBySize() }))
    this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:sort-by-date': () => this.actions.sortByDate() }))
    this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:sort-by-default': () => this.actions.sortByDefault() }))

    this.subscriptions.add(atom.commands.add('atom-text-editor', {
      'atom-commander:upload-file': event => {
        event.stopPropagation()
        this.actions.uploadFile()
      }
    }))

    this.subscriptions.add(atom.commands.add('atom-text-editor', {
      'atom-commander:download-file': event => {
        event.stopPropagation()
        this.actions.downloadFile()
      }
    }))

    this.subscriptions.add(atom.commands.add('atom-text-editor', {
      'atom-commander:compare-with-server': event => {
        event.stopPropagation()
        this.actions.compareWithServer()
      }
    }))

    this.subscriptions.add(atom.commands.add('atom-text-editor', {
      'atom-commander:add-bookmark': event => {
        event.stopPropagation()
        this.actions.bookmarksAddEditor()
      }
    }))

    // Monitor active pane item in docks.
    this.subscriptions.add(atom.workspace.getLeftDock().onDidChangeActivePaneItem(event => {
      this.onDidChangeActivePaneItem(event)
    }))

    this.subscriptions.add(atom.workspace.getRightDock().onDidChangeActivePaneItem(event => {
      this.onDidChangeActivePaneItem(event)
    }))

    this.subscriptions.add(atom.workspace.getBottomDock().onDidChangeActivePaneItem(event => {
      this.onDidChangeActivePaneItem(event)
    }))

    this.subscriptions.add(atom.workspace.getLeftDock().onWillDestroyPaneItem(event => {
      this.onWillDestroyPaneItem(event)
    }))

    this.subscriptions.add(atom.workspace.getRightDock().onWillDestroyPaneItem(event => {
      this.onWillDestroyPaneItem(event)
    }))

    this.subscriptions.add(atom.workspace.getBottomDock().onWillDestroyPaneItem(event => {
      this.onWillDestroyPaneItem(event)
    }))

    // Monitor configuration
    this.subscriptions.add(atom.config.onDidChange('atom-commander.panel.onlyOneWhenVertical', () => {
      if (this.mainView) {
        this.mainView.applyVisibility()
      }
    }))

    if (this.state.visible) {
      return this.show(false)
    }
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

  getServerManager() {
    return this.serverManager
  }

  getSaveFile(): File {
    const configFile = new File(atom.config.getUserConfigPath())
    const directory = configFile.getParent()
    return directory.getFile('atom-commander.json')
  }

  loadState() {
    if (!this.state) {
      this.state = newState()
    }

    const file = this.getSaveFile()

    if (!file.existsSync()) {
      return
    }

    try {
      this.state = JSON.parse(fsp.readFileSync(file.getPath()).toString())
      this.state = Schemas.upgrade(this.state)
    } catch (error) {
      console.log('Error loading Atom Commander state.')
      console.log(error)
    }
  }

  saveState(override?: State) {
    const state = this.serialize(override)
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
    this.serverManager.dispose()

    if (this.mainView) {
      this.mainView.destroy()
    }

    // if (this.statusTile) {
    //   this.statusTile.destroy()
    // }
  }

  serialize(override?: State) {
    let state = newState()

    state = {
      ...state,
      sizeColumnVisible: this.sizeColumnVisible,
      dateColumnVisible: this.dateColumnVisible,
      extensionColumnVisible: this.extensionColumnVisible,
      visible: this.isVisible(),
      bookmarks: this.bookmarkManager.serialize(),
      servers: this.serverManager.serialize(),
    }

    if (override) {
      state = {
        ...state,
        ...override
      }
    }

    if (this.mainView) {
      this.mainView.serialize(state)
    }

    return state
  }

  onWillDestroyPaneItem(event: PaneItemObservedEvent) {
    if (event.item === this.mainView) {
      const state = newState()
      state.visible = false
      this.saveState(state)
    }
  }

  onDidChangeActivePaneItem(item: object) {
    if (item !== this.mainView) {
      return
    }

    const dock = this.getDock()

    if (dock) {
      this.getMainView().setHorizontal(dock.location === 'bottom')
    }
  }

  getDock(): {dock: Dock, location: 'left' | 'right' | 'bottom'} | null {
    if (atom.workspace.getBottomDock().getPaneItems().indexOf(this.mainView) >= 0) {
      return {
        dock: atom.workspace.getBottomDock(),
        location: 'bottom'
      }
    }
    if (atom.workspace.getLeftDock().getPaneItems().indexOf(this.mainView) >= 0) {
      return {
        dock: atom.workspace.getLeftDock(),
        location: 'left'
      }
    }
    if (atom.workspace.getRightDock().getPaneItems().indexOf(this.mainView) >= 0) {
      return {
        dock: atom.workspace.getRightDock(),
        location: 'right'
      }
    }

    return null
  }

  isVisible() {
    return this.isVisibleInDock()
  }

  isVisibleInDock(): boolean {
    const dock = this.getDock()

    if (!dock || !dock.dock.isVisible()) {
      return false
    }

    const activePane = dock.dock.getActivePane()

    if (!activePane) {
      return false
    }

    return activePane.getActiveItem() === this.mainView
  }

  toggle() {
    if (this.isVisible()) {
      this.hide()
    } else {
      this.show(false)
    }
  }

  show(focus: boolean) {
    this.showDock(focus)
    this.state.visible = true
    this.saveState()
  }

  showDock(focus: boolean) {
    let paneContainer: Dock | undefined = atom.workspace.paneContainerForURI(ATOM_COMMANDER_URI) as Dock

    if (paneContainer) {
      paneContainer.show()

      if (focus) {
        this.focus()
      }
    } else {
      atom.workspace.open(this.getMainView(true), {
        searchAllPanes: true,
        activatePane: true,
        activateItem: true
      }).then(() => {
        paneContainer = atom.workspace.paneContainerForURI(ATOM_COMMANDER_URI) as Dock

        if (paneContainer) {
          paneContainer.show()

          if (focus) {
            this.focus()
          }
        }
      })
    }
  }

  hide() {
    if (this.mainView) {
      atom.workspace.hide(this.mainView)
    }

    this.state.visible = false
    this.saveState()
  }

  focus() {
    const mainView = this.getMainView()

    if (mainView) {
      mainView.refocusLastView()
    }
  }

  unfocus() {
    atom.workspace.getCenter().getActivePane().activate()
  }

  hasFocus() {
    if (!this.mainView) {
      return false
    }

    return this.mainView.focusedView && this.mainView.focusedView.hasFocus()
  }

  toggleFocus() {
    if (this.hasFocus()) {
      this.unfocus()
    } else {
      this.show(true)
    }
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
    this.bookmarkManager.fileSystemRemoved(fileSystem)
    
    if (this.mainView) {
      this.mainView.fileSystemRemoved(fileSystem)
    }
  }

  serverClosed(server: Server) {
    if (this.mainView) {
      this.mainView.serverClosed(server)
    }
  }

  getFileSystemWithID(fileSystemId: string) {
    if (this.localFileSystem.getID() === fileSystemId) {
      return this.localFileSystem
    }

    return this.serverManager.getFileSystemWithID(fileSystemId)
  }
}

export const main = new Main()
