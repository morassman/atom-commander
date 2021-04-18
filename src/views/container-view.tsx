const etch = require('etch')

import { main } from '../main'
import { CompositeDisposable, Directory, Disposable } from 'atom'
import { DirectoryController } from '../controllers/directory-controller'
import { FileController } from '../controllers/file-controller'
import { ItemController } from '../controllers/item-controller'
import { SymLinkController } from '../controllers/symlink-controller'
import { VDirectory, VFile, VFileSystem, VItem, VSymLink } from '../fs'
import { LocalFileSystem } from '../fs/local'
import { BaseItemView } from './base-item-view'
import { MainView } from './main-view'
import { TabView } from './tab-view'
import { Props, View } from './view'
import Utils from '../utils'
import * as fsp from 'fs-plus'
import { Server } from '../servers/server'
import { Div } from './element-view'

const minimatch = require('minimatch')
const Scheduler = require('nschedule')
const { filter } = require('fuzzaldrin')
// const {View, TextEditorView} = require('atom-space-pen-views')
// const {CompositeDisposable, Directory} = require('atom')
// const FileController = require('../controllers/file-controller')
// const DirectoryController = require('../controllers/directory-controller')
// const SymLinkController = require('../controllers/symlink-controller')
// const VFile = require('../fs/vfile')
// const VDirectory = require('../fs/vdirectory')
// const VSymLink = require('../fs/vsymlink')
// const ListDirectoryView = require('./list-directory-view')
// HistoryView = require './history-view'

export interface Snapshot {

  index?: number | null
  
  name?: string | null

  selectedNames?: string[]

}

export interface ContainerState {

  sortBy?: string | null

  sortAscending?: boolean

  path?: string | null

  highlight?: string | null

}

export type ContainerViewProps = Props & {

  left: boolean

}

type Refs = {
  username: Div

  directoryEditor: HTMLInputElement

  containerView: Div

  searchPanel: Div

  spinnerPanel: Div
}

export abstract class ContainerView extends View<ContainerViewProps, Refs> {

  left: boolean

  itemViews: BaseItemView<ItemController<VItem>>[]

  directory: VDirectory | null

  directoryDisposable: Disposable | null

  highlightedIndex: number | null

  timeSearchStarted: number | null

  timeKeyPressed: number | null

  showSpinnerCount: number

  scheduler: any

  disposables: CompositeDisposable

  lastLocalPath: string | null

  sortBy: string | null

  sortAscending: boolean

  mainView: MainView

  localFileSystem: LocalFileSystem
  
  tabView: TabView
  
  scrollTop: number

  constructor(props: ContainerViewProps) {
    super(props, false)
    this.left = props.left

    this.itemViews = []
    this.directory = null
    this.directoryDisposable = null
    this.highlightedIndex = null
    this.timeSearchStarted = null
    this.timeKeyPressed = null
    this.showSpinnerCount = 0
    this.scheduler = new Scheduler(1)
    this.disposables = new CompositeDisposable()
    this.lastLocalPath = null
    this.sortBy = null
    this.sortAscending = true
  }

  initialize() {
    super.initialize()

    const container = this.container()

    this.refs.containerView.append(container.element)

    // @disposables.add(atom.tooltips.add(@history, {title: 'History'}))

    if (this.left) {
      this.refs.username.addClass('left-username')
      // @history.addClass('left-history')
    } else {
      this.refs.username.addClass('right-username')
    }
      // @history.addClass('right-history')

    this.refs.username.hide()
    this.refs.searchPanel.hide()
    this.refs.spinnerPanel.hide()

    this.disposables.add(atom.commands.add(this.refs.directoryEditor, {
      'core:confirm': () => this.directoryEditorConfirm(),
      'core:cancel': () => this.directoryEditorCancel()
    }))

    this.disposables.add(atom.commands.add(this.refs.containerView.element, {
      'core:move-up': () => this.moveUp(),
      'core:move-down': () => this.moveDown(),
      'core:page-up': () => this.pageUp(),
      'core:page-down': () => this.pageDown(),
      'core:move-to-top': () => this.highlightFirstItem(),
      'core:move-to-bottom': () => this.highlightLastItem(),
      'core:cancel': () => this.escapePressed(),
      'atom-commander:open-highlighted-item': () => this.openHighlightedItem(false),
      'atom-commander:open-highlighted-item-native': () => this.openHighlightedItem(true),
      'atom-commander:open-parent-folder': () => this.backspacePressed(),
      'atom-commander:highlight-first-item': () => this.highlightFirstItem(),
      'atom-commander:highlight-last-item': () => this.highlightLastItem(),
      'atom-commander:page-up': () => this.pageUp(),
      'atom-commander:page-down': () => this.pageDown(),
      'atom-commander:select-item': () => this.spacePressed()
    }))
  }

  render() {
    return <div className='atom-commander-container-parent-view'>
      <div>
        <Div ref='username' className='highlight-info username' />
        <input ref='directoryEditor' className='directory-editor input-text' type='text' onBlur={() => this.directoryEditorCancel()} onFocus={() => this.onDirectoryEditorFocus()}/>
      </div>
      <Div ref='containerView' className='atom-commander-container-view' onDoubleClick={e => this.onDoubleClick(e)} onMouseDown={e => this.onMouseDown(e)} onKeyPress={e => this.handleKeyPress(e)}/>
      <Div ref='searchPanel' className='search-panel'/>
      <Div ref='spinnerPanel' className='loading-panel'>Loading...</Div>
    </div>
  }

  // static content() {
  //   return this.div({tabindex: -1, style: 'display: flex flex-direction: column flex: 1 overflow: auto'}, () => {
  //     this.div(() => {
  //       this.span('', {class: 'highlight-info username', outlet: 'username'})
  //       // @span '', {class: 'history icon icon-clock', outlet: 'history', click: 'toggleHistory' }
  //       return this.subview('directoryEditor', new TextEditorView({mini: true}))
  //     })
  //     this.div({class: 'atom-commander-container-view', outlet: 'containerView'}, () => {
  //       return this.container()
  //     })
  //     this.div({class: 'search-panel', outlet: 'searchPanel'})
  //     return this.div('Loading...', {class: 'loading-panel', outlet: 'spinnerPanel'})
  // })
  // }
    
  abstract container(): View

  isLeft(): boolean {
    return this.left
  }

  setMainView(mainView: MainView) {
    this.mainView = mainView
    this.localFileSystem = this.mainView.main.getLocalFileSystem()
  }

  getMainView() {
    return this.mainView
  }

  setTabView(tabView: TabView) {
    this.tabView = tabView
    
    if (this.directory) {
      this.tabView.directoryChanged()
    }
  }

  getTabView(): TabView {
    return this.tabView
  }

  getDirectory(): VDirectory | null {
    return this.directory
  }

  getFileSystem(): VFileSystem | null {
    return this.directory ? this.directory.getFileSystem() : null
  }

  getLastLocalPath(): string | null {
    return this.lastLocalPath
  }

  // initialize(state) {
  //   this.searchPanel.hide()
  //   this.spinnerPanel.hide()

  //   // @historyView.set§(@)

  //   if (this.left) {
  //     this.addClass('left-container')
  //   }

  //   this.directoryEditor.addClass('directory-editor')
  //   this.directoryEditor.on('focus', e => {

  //   })

  // }

  onDirectoryEditorFocus() {
    this.mainView.focusedView = this
    // @historyView.close()

    // this.mainView.focusView(this)
    const otherView = this.mainView.getOtherView(this)

    if (otherView) {
      otherView.refreshHighlight()
    }

    this.refreshHighlight()
  }

  onDoubleClick(e: MouseEvent) {
    this.requestFocus()
    const index = this.getItemIndexUnderMouse(e)

    if (index !== null) {
      this.highlightIndex(index, false)
      this.openHighlightedItem()
    }
  }

  onMouseDown(e: MouseEvent) {
    this.requestFocus()
    const index = this.getItemIndexUnderMouse(e)

    if (index !== null) {
      this.highlightIndex(index, false)
    }
  }

  getItemIndexUnderMouse(e: any) {
    for (let p of e.path) {
      if (p.tagName === 'TR' && p.classList.contains('item')) {
        const index = p.rowIndex
        
        if (Number.isFinite(index) && index <= this.itemViews.length) {
          return Math.max(0, index - 1)
        }
      }
    }

    return null
  }

  setHorizontal(horizontal: boolean) {
    this.refs.username.removeClass('vertical-username')

    if (this.left) {
      this.refs.username.removeClass('left-username')

      if (horizontal) {
        this.refs.username.addClass('left-username')
      }
      // @history.addClass('left-history')
    } else {
      this.refs.username.removeClass('right-username')

      if (horizontal) {
        this.refs.username.addClass('right-username')
      }
    }
      // @history.addClass('right-history')

    if (!horizontal) {
      return this.refs.username.addClass('vertical-username')
    }
  }

  // toggleHistory(e) {
  //   return e.stopPropagation()
  // }
    // @historyView.toggle()

  storeScrollTop() {
    this.scrollTop = this.getScrollTop()
  }

  restoreScrollTop() {
    if (this.scrollTop !== null) {
      this.setScrollTop(this.scrollTop)
    }
  }

  abstract getScrollTop(): number

  abstract setScrollTop(scrollTop: number): void

  cancelSpinner() {
    if (this.showSpinnerCount === 0) {
      return
    }

    this.showSpinnerCount = 0
    this.refs.spinnerPanel.hide()
  }

  showSpinner() {
    this.showSpinnerCount++
    this.refs.spinnerPanel.show()
  }

  hideSpinner() {
    this.showSpinnerCount--

    if (this.showSpinnerCount === 0) {
      this.refs.spinnerPanel.hide()
    }
  }

  escapePressed() {
    if (this.refs.searchPanel.isVisible()) {
      this.refs.searchPanel.hide()
    }
  }

  backspacePressed() {
    if (this.refs.searchPanel.isVisible()) {
      this.timeKeyPressed = Date.now()
      const text = this.refs.searchPanel.element.textContent || ''
      this.refs.searchPanel.element.textContent = text.slice(0, -1)
      this.search(text)
    } else {
      this.openParentDirectory()
    }
  }

  spacePressed() {
    if (this.refs.searchPanel.isVisible()) {
      this.timeKeyPressed = Date.now()
      this.refs.searchPanel.element.textContent = this.refs.searchPanel.element.textContent + ' '
      this.search(this.refs.searchPanel.element.textContent)
    } else {
      this.selectItem()
    }
  }

  handleKeyPress(e: KeyboardEvent) {
    if (!this.hasContainerFocus()) {
      return
    }

    // When Alt is down the menu is being shown.
    if (e.altKey) {
      return
    }

    const charCode = e.which | e.keyCode
    const sCode = String.fromCharCode(charCode)

    if (this.refs.searchPanel.isHidden()) {
      if (sCode === '+') {
        this.mainView.main.actions.selectAdd()
        return
      } else if (sCode === '-') {
        this.mainView.main.actions.selectRemove()
        return
      } else if (sCode === '*') {
        this.mainView.main.actions.selectInvert()
        return
      } else {
        this.showSearchPanel()
      }
    } else {
      this.timeKeyPressed = Date.now()
    }

    this.refs.searchPanel.appendTextContent(sCode)

    const text = this.refs.searchPanel.element.textContent

    if (text !== null) {
      this.search(text)
    }
  }

  showSearchPanel() {
    this.timeSearchStarted = Date.now()
    this.timeKeyPressed = this.timeSearchStarted
    this.refs.searchPanel.element.textContent = ''
    this.refs.searchPanel.show()
    this.scheduleTimer()
  }

  scheduleTimer() {
    return this.scheduler.add(1000, (done: any) => {
      const currentTime = Date.now()
      let hide = false

      if (this.timeSearchStarted === this.timeKeyPressed) {
        hide = true
      } else if ((this.timeKeyPressed !== null) && (currentTime - this.timeKeyPressed) >= 1000) {
        hide = true
      }

      done(this.scheduler.STOP)

      if (hide) {
        return this.refs.searchPanel.hide()
      } else {
        return this.scheduleTimer()
      }
    })
  }

  search(text: string) {
    const results = filter(this.itemViews, text, {key: 'itemName', maxResults: 1})

    if (results.length > 0) {
      this.highlightIndexWithName(results[0].itemName)
    }
  }

  getPath() {
    if (this.directory === null) {
      return null
    }

    return this.directory.getRealPathSync()
  }

  getURI() {
    if (this.directory === null) {
      return null
    }

    return this.directory.getURI()
  }

  // includeHighlightIfEmpty : true if the highlighted name should be included if nothing is selected.
  getSelectedNames(includeHighlightIfEmpty=false): string[] {
    let itemView
    const paths = []

    for (itemView of Array.from(this.itemViews)) {
      if (itemView.selected) {
        paths.push(itemView.getName())
      }
    }

    if (includeHighlightIfEmpty && (paths.length === 0) && (this.highlightedIndex !== null)) {
      itemView = this.itemViews[this.highlightedIndex]

      if (itemView.isSelectable()) {
        paths.push(itemView.getName())
      }
    }

    return paths
  }

  getSelectedItemViews(includeHighlightIfEmpty=false): BaseItemView[] {
    const result = []

    for (let itemView of this.itemViews) {
      if (itemView.selected) {
        result.push(itemView)
      }
    }

    if (includeHighlightIfEmpty && (result.length === 0) && (this.highlightedIndex !== null)) {
      let itemView = this.itemViews[this.highlightedIndex]

      if (itemView.isSelectable()) {
        result.push(itemView)
      }
    }

    return result
  }

  getItemViewsWithPattern(pattern: string): BaseItemView[] {
    const result = []

    for (let itemView of this.itemViews) {
      if (minimatch(itemView.getName(), pattern, { dot: true, nocase: true})) {
        result.push(itemView)
      }
    }

    return result
  }

  requestFocus() {
    this.mainView.focusView(this)
  }

  focus() {
    this.refreshHighlight()
  }

  unfocus() {
    atom.workspace.getActivePane().activate()
    this.refreshHighlight()
  }

  hasFocus() {
    return this.hasContainerFocus() || document.activeElement === this.refs.directoryEditor
  }

  // Override and return whether the item container view has focus.
  abstract hasContainerFocus(): boolean

  // Override to remove all item views.
  abstract clearItemViews(): void

  // Override to create a new view for navigating to the parent directory.
  abstract createParentView(index: number, directoryController: DirectoryController): BaseItemView<ItemController<VItem>>

  // Override to creates and return a new view for the given item.
  abstract createFileView(index: number, fileController: FileController): BaseItemView<FileController>

  abstract createDirectoryView(index: number, directoryController: DirectoryController): BaseItemView<DirectoryController>

  abstract createSymLinkView(index: number, symLinkController: SymLinkController): BaseItemView<SymLinkController>

  // Override to add the given item view.
  abstract addItemView(itemView: View): void

  // Override to adjust the height of the content.
  abstract adjustContentHeight(change: number): void

  // Override to return the height of the content.
  abstract getContentHeight(): number

  // Override to set the height of the content.
  abstract setContentHeight(contentHeight: number): void

  // Override to refresh the sort icons.
  abstract refreshSortIcons(sortBy: string, ascending: boolean): void

  abstract pageUp(): void

  abstract pageDown(): void

  moveUp() {
    if (this.highlightedIndex !== null) {
      this.highlightIndex(this.highlightedIndex-1)
    }
  }

  moveDown() {
    if (this.highlightedIndex !== null) {
      this.highlightIndex(this.highlightedIndex+1)
    }
  }

  selectItem() {
    if (this.highlightedIndex === null) {
      return
    }

    const itemView = this.itemViews[this.highlightedIndex]
    itemView.toggleSelect()

    this.highlightIndex(this.highlightedIndex+1)
  }

  highlightFirstItem() {
    this.highlightIndex(0)
  }

  highlightLastItem() {
    if (this.itemViews.length > 0) {
      this.highlightIndex(this.itemViews.length - 1)
    }
  }

  highlightIndex(index: number | null, scroll=true) {
    if (this.highlightedIndex !== null) {
      this.itemViews[this.highlightedIndex].highlight(false, this.hasFocus())
    }

    if (this.itemViews.length === 0) {
      this.highlightedIndex = null
    } else if ((index !== null) && (index < 0)) {
      this.highlightedIndex = 0
    } else if ((index !== null) && (index >= this.itemViews.length)) {
      this.highlightedIndex = this.itemViews.length - 1
    } else {
      this.highlightedIndex = index
    }

    this.refreshHighlight(scroll)
  }

  refreshHighlight(scroll=false) {
    if (this.highlightedIndex !== null) {
      const focused = this.hasFocus()
      const itemView = this.itemViews[this.highlightedIndex]
      itemView.highlight(true, focused)

      if (focused && scroll) {
        itemView.element.scrollIntoView({block: "nearest", inline: "nearest"})
      }
    }
  }

  highlightIndexWithName(name: string) {
    const itemView = this.getItemViewWithName(name)

    if (itemView !== null) {
      this.highlightIndex(itemView.index)
    }
  }

  getItemViewWithName(name: string): BaseItemView | null {
    for (let itemView of this.itemViews) {
      if (itemView.getName() === name) {
        return itemView
      }
    }

    return null
  }

  getHighlightedItem(): BaseItemView | null {
    if (this.highlightedIndex === null) {
      return null
    }

    return this.itemViews[this.highlightedIndex]
  }

  getHighlightedItemName(): string | null {
    if (this.highlightedIndex === null) {
      return null
    }

    return this.itemViews[this.highlightedIndex].getName()
  }

  openHighlightedItem(isNative=false){
    if (this.highlightedIndex === null) {
      return
    }

    if (isNative) {
      main.getActions().openSystem()
    } else {
      const itemView = this.itemViews[this.highlightedIndex]
      itemView.performOpenAction()
    }
  }

  openLastLocalDirectory() {
    this.openDirectory(this.getInitialDirectory(this.lastLocalPath))
  }

  openParentDirectory() {
    if (this.directory && !this.directory.isRoot()) {
      const snapShot: Snapshot = {
        name: this.directory.getBaseName()
      }

      this.openDirectory(this.directory.getParent(), snapShot)
    }
  }

  openDirectory(directory: VDirectory | Directory, snapShot:Snapshot | null = null, callback?: ()=>void) {
    if (this.refs.searchPanel.isVisible()) {
      this.refs.searchPanel.hide()
    }

    if (directory instanceof Directory) {
      directory = this.localFileSystem.getDirectory(directory.getRealPathSync())
    }

    // if (@directory != null) and @directory.getPath() == directory.getPath()
    //   return

    try {
      this.tryOpenDirectory(directory, snapShot, callback)
    } catch (error) {
      console.error(error)
      // If the directory couldn't be opened and one hasn't been opened yet then
      // revert to opening the home folder and finally the PWD.
      if (!this.directory || !fsp.isDirectorySync(this.directory.getRealPathSync())) {
        try {
          this.tryOpenDirectory(this.localFileSystem.getDirectory(fsp.getHomeDirectory()), null, callback)
        } catch (error2) {
          this.tryOpenDirectory(this.localFileSystem.getDirectory(process.cwd()), null, callback)
        }
      }
    }
  }

  tryOpenDirectory(newDirectory: VDirectory, snapShot: Snapshot|null = null, callback?: ()=>void) {
    this.directory = newDirectory
    
    if (this.tabView ) {
      this.tabView.directoryChanged()
    }

    this.cancelSpinner()
    this.disableAutoRefresh()

    this.resetItemViews()
    this.highlightIndex(0)

    this.getEntries(newDirectory, snapShot, callback)

    const fileSystem = this.directory.getFileSystem()

    if (fileSystem.isLocal()) {
      this.lastLocalPath = this.directory.getPath()
      this.refs.username.element.textContent = ''
      this.refs.username.hide()
    } else {
      const displayName = fileSystem.getDisplayName()
      let un = fileSystem.getUsername()

      if (displayName && (displayName.length > 0)) {
        un = displayName + '  -  ' + un
      }

      this.refs.username.element.textContent = un
      this.refs.username.show()
    }
  }

  resetItemViews() {
    this.clearItemViews()

    this.itemViews = []
    this.highlightedIndex = null

    if (!this.directory) {
      return
    }

    this.refs.directoryEditor.value = this.directory.getURI()

    if (!this.directory.isRoot()) {
      const itemView = this.createParentView(0, new DirectoryController(this.directory.getParent()))
      this.itemViews.push(itemView)
      this.addItemView(itemView)
    }
  }

  refreshItemViews() {
    this.itemViews.forEach((itemView) => itemView.refresh())
  }

  getEntries(newDirectory: VDirectory, snapShot: Snapshot|null, callback: any) {
    this.showSpinner()
    newDirectory.getEntries((newDirectory, err, entries) => {
      if (err === null) {
        this.entriesCallback(newDirectory, entries, snapShot, callback)
      } else if ((err.canceled == null)) {
        Utils.showErrorWarning('Error reading folder', null, err, null, false)
        if (typeof callback === 'function') {
          callback(err)
        }
      } else {
        this.openLastLocalDirectory()
      }
      this.hideSpinner()
    })
  }

  entriesCallback(newDirectory: VDirectory, entries: VItem[], snapShot: Snapshot|null, callback: any) {
    if ((this.directory !== null) && (this.directory.getURI() !== newDirectory.getURI())) {
      if (typeof callback === 'function') {
        callback(null)
      }
      return
    }

    let highlightIndex = 0

    if (this.highlightedIndex !== null) {
      highlightIndex = this.highlightedIndex
    }

    this.resetItemViews()

    let index = this.itemViews.length

    for (let entry of Array.from(entries)) {
      var itemView
      if (entry instanceof VFile) {
        itemView = this.createFileView(index, new FileController(entry))
      } else if (entry instanceof VDirectory) {
        itemView = this.createDirectoryView(index, new DirectoryController(entry))
      } else if (entry instanceof VSymLink) {
        itemView = this.createSymLinkView(index, new SymLinkController(entry))
      } else {
        itemView = null
      }

      if (itemView != null) {
        this.itemViews.push(itemView)
        // @addItemView(itemView)
        index++
      }
    }

    if (this.itemViews.length > 0) {
      this.highlightIndex(highlightIndex)
    }

    this.restoreSnapShot(snapShot)
    this.enableAutoRefresh()
    this.sort(true)
    return (typeof callback === 'function' ? callback(null) : undefined)
  }

  disableAutoRefresh() {
    if (this.directoryDisposable !== null) {
      this.directoryDisposable.dispose()
      return this.directoryDisposable = null
    }
  }

  enableAutoRefresh() {
    if (this.directoryDisposable !== null) {
      return
    }

    if (this.directory) {
      try {
        this.directoryDisposable = this.directory.onDidChange(() => {
          this.refreshDirectory()
        })
      } catch (error) {}
    }
  }

  selectNames(names: string[]) {
    for (let itemView of this.itemViews) {
      if (names.indexOf(itemView.getName()) > -1) {
        itemView.select(true)
      }
    }
  }

  getNames(): string[] {
    const names = []

    for (let itemView of this.itemViews) {
      names.push(itemView.getName())
    }

    return names
  }

  refreshDirectory() {
    this.refreshDirectoryWithSnapShot(this.captureSnapShot())
  }

  refreshDirectoryWithSnapShot(snapShot: Snapshot) {
    if (this.directory) {
      this.openDirectory(this.directory, snapShot)
    }
  }

  captureSnapShot(): Snapshot {
    return {
      index: this.highlightedIndex,
      name: this.getHighlightedItemName(),
      selectedNames: this.getSelectedNames()
    }
  }

  restoreSnapShot(snapShot: Snapshot | null) {
    if (!snapShot) {
      return
    }

    let {
      index
    } = snapShot

    if (snapShot.name != null) {
      // If the item with the name still exists then highlight it, otherwise highlight the index.
      const itemView = this.getItemViewWithName(snapShot.name)

      if (itemView !== null) {
        ({
          index
        } = itemView)
      }
    }

    if (index != null) {
      this.highlightIndex(index)
    }

    if (snapShot.selectedNames != null) {
      return this.selectNames(snapShot.selectedNames)
    }
  }

  setDirectory(path: string) {
    if (!fsp.isDirectorySync(path)) {
      return
    }

    this.refs.directoryEditor.value = path
    return this.directoryEditorConfirm()
  }

  directoryEditorConfirm() {
    const uri = this.refs.directoryEditor.value.trim()

    if (fsp.isDirectorySync(uri)) {
      this.openDirectory(this.localFileSystem.getDirectory(uri), null, () => this.focus())
      return
    } else if (fsp.isFileSync(uri)) {
      const file = this.localFileSystem.getFile(uri)
      main.actions.goFile(file, true)
      return
    }

    if (!this.directory) {
      return
    }

    const fileSystem = this.directory.getFileSystem()

    if (fileSystem.isLocal()) {
      return
    }

    const path = fileSystem.getPathFromURI(uri)

    if (path !== null) {
      const dir = fileSystem.getDirectory(path)

      if (dir) {
        this.openDirectory(dir, null, () => this.focus())
      }
    }
  }

    // # TODO : The file system may change.
    // directory = @directory.fileSystem.getDirectory(@directoryEditor.getText().trim())
    //
    // if directory.existsSync() and directory.isDirectory()
    //   @openDirectory(directory)

  directoryEditorCancel() {
    if (this.directory) {
      this.refs.directoryEditor.value = this.directory.getURI()
    }
  }

  addProject() {
    this.addRemoveProject(true)
  }

  removeProject() {
    this.addRemoveProject(false)
  }

  addRemoveProject(add: boolean) {
    if (this.directory === null) {
      return
    }

    if (!this.directory.fileSystem.isLocal()) {
      atom.notifications.addWarning('Remote project folders are not yet supported.')
      return
    }

    const selectedItemViews = this.getSelectedItemViews(true)
    const directories = []

    for (let selectedItemView of selectedItemViews) {
      if (selectedItemView.isSelectable() && (selectedItemView.itemController instanceof DirectoryController)) {
        directories.push(selectedItemView.itemController.getDirectory())
      }
    }

    if (directories.length === 0) {
      if (add) {
        atom.project.addPath(this.directory.getPath())
      } else {
        atom.project.removePath(this.directory.getPath())
      }
    } else {
      directories.forEach((directory) => {
        if (add) {
          atom.project.addPath(directory.getPath())
        } else {
          atom.project.removePath(directory.getPath())
        }
      })
    }
  }

  selectAll() {
    this.itemViews.forEach(itemView => {
      if (itemView.isSelectable()) {
        itemView.select(true)
      }
    })
  }

  selectNone() {
    this.itemViews.forEach(itemView => {
      if (itemView.isSelectable()) {
        itemView.select(false)
      }
    })
  }

  selectInvert() {
    this.itemViews.forEach(itemView => {
      if (itemView.isSelectable()) {
        itemView.toggleSelect()
      }
    })
  }

  getInitialDirectory(suggestedPath?: string | null) {
    if (suggestedPath&& fsp.isDirectorySync(suggestedPath)) {
      return this.localFileSystem.getDirectory(suggestedPath)
    }

    const directories = atom.project.getDirectories()

    if (directories.length > 0) {
      return this.localFileSystem.getDirectory(directories[0].getRealPathSync())
    }

    return this.localFileSystem.getDirectory(fsp.getHomeDirectory())
  }

  fileSystemRemoved(fileSystem: VFileSystem) {
    if (this.directory && this.directory.getFileSystem() === fileSystem) {
      this.openDirectory(this.getInitialDirectory(this.lastLocalPath))
    }
  }

  serverClosed(server: Server) {
    if (this.directory && (this.directory.getFileSystem() === server.getFileSystem())) {
      this.openDirectory(this.getInitialDirectory(this.lastLocalPath))
    }
  }

  isSizeColumnVisible(): boolean {
    return this.mainView.isSizeColumnVisible()
  }

  isDateColumnVisible(): boolean {
    return this.mainView.isDateColumnVisible()
  }

  isExtensionColumnVisible(): boolean {
    return this.mainView.isExtensionColumnVisible()
  }

  setSizeColumnVisible(visible: boolean) {
    this.itemViews.forEach(itemView => itemView.setSizeColumnVisible(visible))
  }

  setDateColumnVisible(visible: boolean) {
    this.itemViews.forEach(itemView => itemView.setDateColumnVisible(visible))
  }

  setExtensionColumnVisible(visible: boolean) {
    this.itemViews.forEach(itemView => itemView.setExtensionColumnVisible(visible))
  }

  setSortBy(sortBy: string | null) {
    if (this.sortBy === sortBy) {
      if (sortBy === null) {
        return
      }
      this.sortAscending = !this.sortAscending
    } else {
      this.sortBy = sortBy
      this.sortAscending = true
    }

    if (!sortBy) {
      this.refreshDirectory()
    } else {
      this.sort(true)
    }
  }

  sort(scrollToHighlight=false) {
    if (this.itemViews.length === 0) {
      return
    }

    const prevHighlightIndex = this.highlightedIndex
    this.highlightIndex(null, false)
    this.clearItemViews()

    // Separate files and directories.
    let parentItemView = null
    const dirItemViews = []
    const fileItemViews = []

    for (let itemView of this.itemViews) {
      const item = itemView.getItem()

      if (item.isFile()) {
        fileItemViews.push(itemView)
      } else if (item.isDirectory()) {
        if (itemView.isForParentDirectory()) {
          parentItemView = itemView
        } else {
          dirItemViews.push(itemView)
        }
      }
    }

    if (this.sortBy) {
      Utils.sortItemViews(true, dirItemViews, this.sortBy, this.sortAscending)
      Utils.sortItemViews(false, fileItemViews, this.sortBy, this.sortAscending)
    }

    this.itemViews = []

    if (parentItemView != null) {
      this.itemViews.push(parentItemView)
    }

    this.itemViews = this.itemViews.concat(dirItemViews)
    this.itemViews = this.itemViews.concat(fileItemViews)

    let index = 0
    let newHighlightIndex = null

    for (let itemView of this.itemViews) {
      if ((newHighlightIndex == null) && (itemView.index === prevHighlightIndex)) {
        newHighlightIndex = index
      }
      itemView.index = index++
      this.addItemView(itemView)
    }

    if (newHighlightIndex !== null) {
      this.highlightIndex(newHighlightIndex, scrollToHighlight)
    }

    if (this.sortBy) {
      this.refreshSortIcons(this.sortBy, this.sortAscending)
    }
  }

  deserialize(path: string | null, state: ContainerState) {
    if (!state) {
      this.openDirectory(this.getInitialDirectory(path))
      return
    }

    this.sortBy = state.sortBy ? state.sortBy : null
    this.sortAscending = state.sortAscending === true

    const snapShot: Snapshot = {
      name: state.highlight
    }

    this.openDirectory(this.getInitialDirectory(state.path ? state.path : null), snapShot)
  }

    // if state.highlight?
    //   @highlightIndexWithName(state.highlight)

  serialize(): ContainerState {
    const state: ContainerState = {}
    state.sortBy = this.sortBy
    state.sortAscending = this.sortAscending

    if (this.directory && this.directory.isLocal()) {
      state.path = this.getPath()
      state.highlight = this.getHighlightedItemName()
    } else {
      state.path = this.lastLocalPath
    }

    return state
  }

  dispose() {
    return this.disposables.dispose()
  }

}
