const etch = require('etch')

import { Props, View } from './view'
import * as fs from 'fs-plus'
import { Directory, Task, ViewModel } from 'atom'
import { Main, State } from '../main'

// const ListView = require('./views/list-view')
// const MenuBarView = require('./views/menu/menu-bar-view')
// const NewFileDialog = require('./dialogs/new-file-dialog')
// const NewDirectoryDialog = require('./dialogs/new-directory-dialog')
// const RenameDialog = require('./dialogs/rename-dialog')
// const DuplicateFileDialog = require('./dialogs/duplicate-file-dialog')
import { FileController } from '../controllers/file-controller'
import { DirectoryController } from '../controllers/directory-controller'
// const FTPFileSystem = require('./fs/ftp/ftp-filesystem')
import Utils from '../utils'
import { TabbedView } from './tabbed-view'
import { ContainerView } from './container-view'
import { Server } from '../servers/server'
import { VFileSystem } from '../fs'
import { MenuBarView } from './menu/menu-bar-view'
import { Div } from './element-view'

export const ATOM_COMMANDER_URI = 'atom://atom-commander'

etch.setScheduler(atom.views)

type Refs = {

  leftTabbedView: TabbedView

  rightTabbedView: TabbedView

  menuBar: Div

}

export class MainView extends View<Props, Refs> implements ViewModel {

  alternateButtons: boolean

  sizeColumnVisible: boolean

  dateColumnVisible: boolean

  extensionColumnVisible: boolean

  focusedView: ContainerView | null

  horizontal: boolean

  constructor(public readonly main: Main, state: State) {
    super({}, false)

    this.horizontal = true
    this.alternateButtons = false
    
    this.sizeColumnVisible = state.sizeColumnVisible
    this.dateColumnVisible = state.dateColumnVisible
    this.extensionColumnVisible = state.extensionColumnVisible

    this.initialize()

    // this.refs.menuBar.setMainView(this)
    // this.leftTabbedView.setMainView(this)
    // this.rightTabbedView.setMainView(this)

    this.refs.leftTabbedView.deserialize(state.version, state.leftPath || null, state.left)
    this.refs.rightTabbedView.deserialize(state.version, state.rightPath || null, state.right)

    // this.customHeight = state.height

    // if (!atom.config.get('atom-commander.panel.showInDock')) {
    //   this.setHeight(state.height)
    // }

    this.focusedView = this.getLeftView()
  }

  initialize() {
    super.initialize()

    this.refs.leftTabbedView.addClass('left')
    this.refs.rightTabbedView.addClass('right')

    this.refs.menuBar.hide()

    atom.commands.add(this.element, {
      'atom-commander:focus-other-view': () => this.focusOtherView(),
      'atom-commander:rename': () => this.renameButton(),
      'atom-commander:add-project': () => this.addProjectButton(),
      'atom-commander:remove-project': () => this.removeProjectButton(),
      'atom-commander:new-file': () => this.newFileButton(),
      'atom-commander:copy': () => this.copyButton(),
      'atom-commander:duplicate': () => this.duplicateButton(),
      'atom-commander:move': () => this.moveButton(),
      'atom-commander:new-folder': () => this.newDirectoryButton(),
      'atom-commander:delete': () => this.deleteButton(),
      'atom-commander:focus': () => this.focusButton(),
      'atom-commander:hide': () => this.hideButton(),
      'atom-commander:mirror': () => this.mirror(),
      'atom-commander:add-tab': () => this.addTab(),
      'atom-commander:remove-tab': () => this.removeTab(),
      'atom-commander:previous-tab': () => this.previousTab(),
      'atom-commander:next-tab': () => this.nextTab(),
      'atom-commander:shift-tab-left': () => this.shiftTabLeft(),
      'atom-commander:shift-tab-right': () => this.shiftTabRight(),
      'atom-commander:copy-paths': () => this.copyPaths(false),
      'atom-commander:copy-path-names': () => this.copyPaths(true)
    })
  }

  render(): any {
    // TODO menuBar
    return <div className='atom-commander' on={{keyup: (e: KeyboardEvent) => this.handleKeyUp(e), keydown: (e: KeyboardEvent) => this.handleKeyDown(e), keypress: (e: KeyboardEvent) => this.handleKeyPress(e)}}>
      {/* <MenuBarView ref='menuBar'/> */}
      <Div ref='menuBar'/>
      <div ref='contentView' className='content'>
        <TabbedView ref='leftTabbedView' mainView={this} left={true} />
        <TabbedView ref='rightTabbedView' mainView={this} left={false} />
      </div>
    </div>
  }

  // static content() {
  //   const buttonStyle = ''

  //   return this.div({class: 'atom-commander'}, () => {
  //     this.div({class: 'atom-commander-resize-handle', outlet: 'resizeHandle'})
  //     this.subview('menuBar', new MenuBarView())
  //     this.div({class: 'content', outlet: 'contentView'}, () => {
  //       this.subview('leftTabbedView', new TabbedView(true))
  //       return this.subview('rightTabbedView', new TabbedView(false))
  //     })
  //     return this.div({tabindex: -1, class: 'atom-commander-button-bar btn-group-xs'}, () => {
  //       this.button({tabindex: -1, class: 'btn', style: buttonStyle, click: 'menuButton'}, () => {
  //         this.span('Alt', {class: 'key text-highlight'})
  //         return this.span('Menu')
  //       })
  //       this.button({tabindex: -1, class: 'btn', style: buttonStyle, click: 'renameButton'}, () => {
  //         this.span('F2', {class: 'key text-highlight'})
  //         return this.span('Rename')
  //       })
  //       this.button({tabindex: -1, class: 'btn', style: buttonStyle, click: 'addRemoveProjectButton'}, () => {
  //         this.span('F3', {class: 'key text-highlight'})
  //         return this.span('Add Project', {outlet: 'F3ButtonLabel'})
  //     })
  //       this.button({tabindex: -1, class: 'btn', style: buttonStyle, click: 'newFileButton'}, () => {
  //         this.span('F4', {class: 'key text-highlight'})
  //         return this.span('New File')
  //       })
  //       this.button({tabindex: -1, class: 'btn', style: buttonStyle, click: 'copyDuplicateButton'}, () => {
  //         this.span('F5', {class: 'key text-highlight'})
  //         return this.span('Copy', {outlet: 'F5ButtonLabel'})
  //     })
  //       this.button({tabindex: -1, class: 'btn', style: buttonStyle, click: 'moveButton'}, () => {
  //         this.span('F6', {class: 'key text-highlight'})
  //         return this.span('Move')
  //       })
  //       this.button({tabindex: -1, class: 'btn', style: buttonStyle, click: 'newDirectoryButton'}, () => {
  //         this.span('F7', {class: 'key text-highlight'})
  //         return this.span('New Folder')
  //       })
  //       this.button({tabindex: -1, class: 'btn', style: buttonStyle, click: 'deleteButton'}, () => {
  //         this.span('F8', {class: 'key text-highlight'})
  //         return this.span('Delete')
  //       })
  //       this.button({tabindex: -1, class: 'btn', style: buttonStyle, click: 'focusButton'}, () => {
  //         this.span('F9', {class: 'key text-highlight'})
  //         return this.span('Focus')
  //       })
  //       this.button({tabindex: -1, class: 'btn', style: buttonStyle, click: 'hideButton'}, () => {
  //         this.span('F10', {class: 'key text-highlight'})
  //         return this.span('Hide')
  //       })
  //       return this.button({tabindex: -1, class: 'btn', style: buttonStyle, click: 'shiftButton'}, () => {
  //         this.span('Shift', {class: 'key text-highlight'})
  //         return this.span('More...')
  //       })
  //     })
  //   })
  // }

  // // initialize() {

  // //   this.on('mousedown', '.atom-commander-resize-handle', e => this.resizeStarted(e))

  // // }

  async destroy() {
    await this.refs.leftTabbedView.destroy()
    await this.refs.rightTabbedView.destroy()
    await this.refs.menuBar.destroy()
    await super.destroy()
  }

  getTitle(): string {
    return 'Atom Commander'
  }

  getURI(): string {
    return ATOM_COMMANDER_URI
  }

  getPreferredLocation(): string {
    return 'bottom'
  }

  getAllowedLocations(): string[] {
    return ['bottom', 'left', 'right']
  }

  isPermanentDockItem(): boolean {
    return false
  }

  getElement() {
    return this.element
  }

  handleKeyDown(e: KeyboardEvent) {
    if (e.altKey && !e.ctrlKey && !e.metaKey && this.refs.menuBar.isHidden()) {
      this.showMenuBar()
      e.preventDefault()
      e.stopPropagation()
    } else if (this.refs.menuBar.isVisible()) {
      // TODO
      // this.refs.menuBar.handleKeyDown(e)
      e.preventDefault()
      e.stopPropagation()
    } else if (e.shiftKey) {
      this.showAlternateButtons()
    }
  }

  handleKeyUp(e: KeyboardEvent) {
    if (e.altKey) {
      // TODO
      // this.refs.menuBar.handleKeyUp(e)
      e.preventDefault()
      e.stopPropagation()
    } else if (this.refs.menuBar.isVisible()) {
      this.hideMenuBar()
      e.preventDefault()
      e.stopPropagation()
    } else if (!e.shiftKey) {
      this.hideAlternateButtons()
    }
  }

  handleKeyPress(e: KeyboardEvent) {
    if (this.refs.menuBar.isVisible()) {
      // TODO
      // this.refs.menuBar.handleKeyUp(e)
      e.preventDefault()
      e.stopPropagation()
    }
  }

  toggleMenuBar() {
    if (this.refs.menuBar.isVisible()) {
      this.hideMenuBar()
    } else {
      this.showMenuBar()
    }
  }

  showMenuBar() {
    // TODO
    // this.refs.menuBar.reset()
    this.refs.menuBar.show()
  }

  hideMenuBar() {
    this.refs.menuBar.hide()
    // TODO
    // this.refs.menuBar.reset()
    this.refocusLastView()
  }

  toggleAlternateButtons() {
    if (this.alternateButtons) {
      this.hideAlternateButtons()
    } else {
      this.showAlternateButtons()
    }
  }

  showAlternateButtons() {
    this.alternateButtons = true
    // TODO
    // this.F3ButtonLabel.text('Remove Project')
    // this.F5ButtonLabel.text('Duplicate')
  }

  hideAlternateButtons() {
    this.alternateButtons = false
    // TODO
    // this.F3ButtonLabel.text('Add Project')
    // this.F5ButtonLabel.text('Copy')
  }

  // resizeStarted() {
  //   $(document).on('mousemove', this.resizeView)
  //   return $(document).on('mouseup', this.resizeStopped)
  // }

  // resizeStopped() {
  //   $(document).off('mousemove', this.resizeView)
  //   return $(document).off('mouseup', this.resizeStopped)
  // }

  // resizeView({pageY, which}?) {
  //   if (which !== 1) { return this.resizeStopped() }

  //   const change = this.offset().top - pageY
  //   return this.setHeight(this.outerHeight() + change)
  // }

  // setHeight(customHeight?) {
  //   this.customHeight = customHeight
  //   if ((this.customHeight == null)) {
  //     this.customHeight = 200
  //   } else if (this.customHeight < 50) {
  //     this.customHeight = 50
  //   }

  //   return this.height(this.customHeight)
  // }

  // getMain() {
  //   return this.main
  // }

  getLeftView() {
    return this.refs.leftTabbedView.getSelectedView()
  }

  getRightView() {
    return this.refs.rightTabbedView.getSelectedView()
  }

  getOtherView(view: ContainerView | null): ContainerView | null {
    if (!view) {
      return null
    }

    return view.isLeft() ? this.getRightView() : this.getLeftView()
  }

  // setHorizontal(horizontal) {
  //   this.horizontal = horizontal

  //   if (this.horizontal) {
  //     this.contentView.addClass('content-horizontal')
  //     this.contentView.removeClass('content-vertical')
  //   } else {
  //     this.contentView.addClass('content-vertical')
  //     this.contentView.removeClass('content-horizontal')
  //   }

  //   this.getLeftView().setHorizontal(horizontal)
  //   this.getRightView().setHorizontal(horizontal)

  //   return this.applyVisibility()
  // }

  focusView(focusedView: ContainerView | null) {
    if (!focusedView) {
      return
    }

    const otherView = focusedView ? this.getOtherView(focusedView) : null

    this.focusedView = focusedView

    if (this.focusedView) {
      this.focusedView.focus()
    }

    if (otherView) {
      otherView.unfocus()
    }

    this.applyVisibility()
  }

  // showInDockChanged(height) {}
  //   // TODO : Call this when toggling docked mode without recreating main view.

  //   // if atom.config.get('atom-commander.panel.showInDock')
  //   //   @height('100%')
  //   //   @resizeHandle.hide()
  //   //   @applyVisibility()
  //   // else
  //   //   @height(height)
  //   //   @resizeHandle.show()
  //   //   @setHorizontal(true)

  applyVisibility() {
    const onlyOne = atom.config.get('atom-commander.panel.onlyOneWhenVertical')

    if (this.horizontal || !onlyOne) {
      this.refs.leftTabbedView.show()
      this.refs.rightTabbedView.show()
      return
    }

    if (this.getRightView() === this.focusedView) {
      this.refs.leftTabbedView.hide()
      this.refs.rightTabbedView.show()
    } else {
      this.refs.leftTabbedView.show()
      this.refs.rightTabbedView.hide()
    }
  }

  focusOtherView() {
    this.focusView(this.getOtherView(this.focusedView))
  }

  addRemoveProjectButton() {
    if (this.alternateButtons) {
      this.removeProjectButton()
    } else {
      this.addProjectButton()
    }
  }

  addProjectButton() {
    if (this.focusedView !== null) {
      this.focusedView.addProject()
    }
  }

  removeProjectButton() {
    if (this.focusedView !== null) {
      this.focusedView.removeProject()
    }
  }

  getFocusedViewDirectory() {
    return this.focusedView ? this.focusedView.directory : null
  }

  menuButton() {
    this.toggleMenuBar()
  }

  shiftButton() {
    this.toggleAlternateButtons()
  }

  renameButton() {
    // TODO
    // let dialog
    // if (this.focusedView === null) {
    //   return
    // }

    // const itemView = this.focusedView.getHighlightedItem()

    // if ((itemView === null) || !itemView.canRename()) {
    //   return
    // }

    // if (itemView.itemController instanceof FileController) {
    //   dialog = new RenameDialog(this.focusedView, itemView.itemController.getFile())
    //   return dialog.attach()
    // } else if (itemView.itemController instanceof DirectoryController) {
    //   dialog = new RenameDialog(this.focusedView, itemView.itemController.getDirectory())
    //   return dialog.attach()
    // }
  }

  newFileButton() {
    // TODO
    // const directory = this.getFocusedViewDirectory()

    // if (directory === null) {
    //   return
    // }

    // const dialog = new NewFileDialog(this.focusedView, directory, this.focusedView.getNames())
    // return dialog.attach()
  }

  copyDuplicateButton() {
    if (this.alternateButtons) {
      this.duplicateButton()
    } else {
      this.copyButton()
    }
  }

  copyButton() {
    this.copyOrMoveButton(false)
  }

  moveButton() {
    this.copyOrMoveButton(true)
  }

  copyOrMoveButton(move: boolean) {
    // TODO
    // let items, srcItemView
    // if (this.focusedView === null) {
    //   return
    // }

    // const srcView = this.focusedView
    // const dstView = this.getOtherView(srcView)

    // // Do nothing if the src and dst folders are the same.
    // if (srcView.getURI() === dstView.getURI()) {
    //   return
    // }

    // // Do nothing if nothing is selected.
    // const srcItemViews = srcView.getSelectedItemViews(true)

    // if (srcItemViews.length === 0) {
    //   return
    // }

    // const srcFileSystem = srcView.directory.fileSystem
    // const dstFileSystem = dstView.directory.fileSystem

    // if (move) {
    //   if (srcFileSystem.isRemote() || dstFileSystem.isRemote()) {
    //     atom.notifications.addWarning('Move to/from remote file systems is not yet supported.')
    //     return
    //   }
    // } else if (srcFileSystem.isRemote() && dstFileSystem.isRemote()) {
    //   atom.notifications.addWarning('Copy between remote file systems is not yet supported.')
    //   return
    // }

    // const srcPath = srcView.getPath()
    // const dstPath = dstView.getPath()

    // if (srcFileSystem.isRemote()) {
    //   items = []

    //   for (srcItemView of Array.from(srcItemViews)) {
    //     items.push(srcItemView.getItem())
    //   }

    //   srcFileSystem.getTaskManager().downloadItems(dstPath, items, function(canceled, err, item) {
    //     if (!canceled && (err != null)) {
    //       const message = 'Error downloading '+item.getURI()
    //       return Utils.showErrorWarning('Download failed', message, null, err, true)
    //     }
    //   })

    //   return
    // }

    // if (dstFileSystem.isRemote()) {
    //   items = []

    //   for (srcItemView of Array.from(srcItemViews)) {
    //     items.push(srcItemView.getItem())
    //   }

    //   dstFileSystem.getTaskManager().uploadItems(dstPath, items, function(canceled, err, item) {
    //     if (!canceled && (err != null)) {
    //       const message = 'Error uploading '+item.getURI()
    //       return Utils.showErrorWarning('Upload failed', message, null, err, true)
    //     }
    //   })

    //   return
    // }

    // const srcNames = []

    // for (srcItemView of Array.from(srcItemViews)) {
    //   srcNames.push(srcItemView.getName())
    // }

    // const task = Task.once(require.resolve('./tasks/copy-task'), srcPath, srcNames, dstPath, move, function() {
    //   if (move) {
    //     srcView.refreshDirectory()
    //   }

    //   return dstView.refreshDirectory()
    // })

    // return task.on('success', data => {
    //   return srcItemViews[data.index].select(false)
    // })
  }

  duplicateButton() {
    // TODO
    // if (this.focusedView === null) {
    //   return
    // }

    // const {
    //   fileSystem
    // } = this.focusedView.directory

    // if (fileSystem.isRemote()) {
    //   atom.notifications.addWarning('Duplicate on remote file systems is not yet supported.')
    //   return
    // }

    // const itemView = this.focusedView.getHighlightedItem()

    // if ((itemView === null) || !itemView.isSelectable()) {
    //   return
    // }

    // const item = itemView.getItem()

    // if (item.isFile() || item.isDirectory()) {
    //   const dialog = new DuplicateFileDialog(this.focusedView, item)
    //   return dialog.attach()
    // }
  }

  deleteButton() {
    // TODO
  //   if (this.focusedView === null) {
  //     return
  //   }

  //   // Create a local variable of the focused view in case the focus changes while deleting.
  //   const view = this.focusedView
  //   const itemViews = view.getSelectedItemViews(true)

  //   if (itemViews.length === 0) {
  //     return
  //   }

  //   let detailedMessage = 'Delete the selected items?'

  //   if (itemViews.length === 1) {
  //     const itemView = itemViews[0]

  //     if (itemView.getItem().isFile()) {
  //       detailedMessage = 'Delete the file '' + itemView.getName() + ''?'
  //     } else {
  //       detailedMessage = 'Delete the folder '' + itemView.getName() + ''?'
  //     }
  //   }

  //   const response = atom.confirm({
  //     message: 'Delete',
  //     detailedMessage,
  //     buttons: ['No', 'Yes']})

  //   if (response === 0) {
  //     return
  //   }

  //   let index = 0
  //   var callback = err => {
  //     if (err != null) {
  //       const title = 'Error deleting ' + itemViews[index].getItem().getPath()
  //       let post = null
  //       if (itemViews[index].getItem().isDirectory()) {
  //         post = 'Make sure the folder is empty before deleting it.'
  //       }
  //       Utils.showErrorWarning(title, null, post, err, true)
  //     }

  //     index++

  //     if (index === itemViews.length) {
  //       return this.focusedView.refreshDirectory()
  //     } else {
  //       return itemViews[index].getItem().delete(callback)
  //     }
  //   }

  //   return itemViews[0].getItem().delete(callback)
  }

  newDirectoryButton() {
    // TODO
    // const directory = this.getFocusedViewDirectory()

    // if (directory === null) {
    //   return
    // }

    // const dialog = new NewDirectoryDialog(this.focusedView, directory)
    // return dialog.attach()
  }

  focusButton() {
    this.main.toggleFocus()
  }

  hideButton() {
    this.main.hide()
  }

  mirror() {
    const otherView = this.getOtherView(this.focusedView)
    
    if (otherView && this.focusedView && this.focusedView.directory) {
      const snapShot = this.focusedView.captureSnapShot()
      otherView.openDirectory(this.focusedView.directory, snapShot)
    }
  }

  swap() {
    const otherView = this.getOtherView(this.focusedView)

    if (!this.focusedView || !otherView) {
      return
    }

    const snapShot = this.focusedView.captureSnapShot()
    const otherSnapShot = otherView.captureSnapShot()

    const { directory } = this.focusedView
    const otherDirectory = otherView.directory

    if (directory && otherDirectory) {
      this.focusedView.openDirectory(otherDirectory, otherSnapShot)
      otherView.openDirectory(directory, snapShot)
      otherView.requestFocus()
    }
  }

  refocusLastView() {
    if (this.focusedView !== null) {
      this.focusView(this.focusedView)
    } else {
      const leftView = this.getLeftView()

      if (leftView) {
        this.focusView(leftView)
      }
    }
  }

  getFocusedTabbedView(): TabbedView | null {
    if (!this.focusedView) {
      return null
    }

    if (this.focusedView.isLeft()) {
      return this.refs.leftTabbedView
    }

    return this.refs.rightTabbedView
  }

  addTab() {
    const focusedTabbedView = this.getFocusedTabbedView()

    if (focusedTabbedView) {
      focusedTabbedView.insertTab()
    }
  }

  removeTab() {
    const focusedTabbedView = this.getFocusedTabbedView()

    if (focusedTabbedView) {
      focusedTabbedView.removeSelectedTab()
    }
  }

  previousTab() {
    const focusedTabbedView = this.getFocusedTabbedView()

    if (focusedTabbedView) {
      focusedTabbedView.previousTab()
    }
  }

  nextTab() {
    const focusedTabbedView = this.getFocusedTabbedView()

    if (focusedTabbedView) {
      focusedTabbedView.nextTab()
    }
  }

  shiftTabLeft() {
    const focusedTabbedView = this.getFocusedTabbedView()

    if (focusedTabbedView) {
      focusedTabbedView.shiftLeft()
    }
  }

  shiftTabRight() {
    const focusedTabbedView = this.getFocusedTabbedView()

    if (focusedTabbedView) {
      focusedTabbedView.shiftRight()
    }
  }

  copyPaths(namesOnly: boolean) {
    if (this.focusedView !== null) {
      const itemViews = this.focusedView.getSelectedItemViews(true)
      if (itemViews.length > 0) {
        let paths
        if (namesOnly) {
          paths = itemViews.map(i => i.getName())
        } else {
          paths = itemViews.map(i => i.getPath())
        }
        const text = paths.join('\n')
        atom.clipboard.write(text)
        if (paths.length === 1) {
          if (namesOnly) {
            atom.notifications.addInfo('Copied name \'' + paths[0] + '\' to clipboard.')
          } else {
            atom.notifications.addInfo('Copied path \'' + paths[0] + '\' to clipboard.')
          }
        } else {
          if (namesOnly) {
            atom.notifications.addInfo('Copied ' + paths.length + ' names to clipboard.')
          } else {
            atom.notifications.addInfo('Copied ' + paths.length + ' paths to clipboard.')
          }
        }
      }
    }
  }

  tabCountChanged() {
    const totalTabs = this.refs.leftTabbedView.getTabCount() + this.refs.rightTabbedView.getTabCount()
    this.refs.leftTabbedView.setTabsVisible(totalTabs > 2)
    this.refs.rightTabbedView.setTabsVisible(totalTabs > 2)
  }

  fileSystemRemoved(fileSystem: VFileSystem) {
    this.refs.leftTabbedView.fileSystemRemoved(fileSystem)
    this.refs.rightTabbedView.fileSystemRemoved(fileSystem)
  }

  serverClosed(server: Server) {
    this.refs.leftTabbedView.serverClosed(server)
    this.refs.rightTabbedView.serverClosed(server)
  }

  isSizeColumnVisible() {
    return this.sizeColumnVisible
  }

  isDateColumnVisible() {
    return this.dateColumnVisible
  }

  isExtensionColumnVisible() {
    return this.extensionColumnVisible
  }

  // toggleSizeColumn() {
  //   this.sizeColumnVisible = !this.sizeColumnVisible
  //   this.leftTabbedView.setSizeColumnVisible(this.sizeColumnVisible)
  //   return this.rightTabbedView.setSizeColumnVisible(this.sizeColumnVisible)
  // }

  // toggleDateColumn() {
  //   this.dateColumnVisible = !this.dateColumnVisible
  //   this.leftTabbedView.setDateColumnVisible(this.dateColumnVisible)
  //   return this.rightTabbedView.setDateColumnVisible(this.dateColumnVisible)
  // }

  // toggleExtensionColumn() {
  //   this.extensionColumnVisible = !this.extensionColumnVisible
  //   this.leftTabbedView.setExtensionColumnVisible(this.extensionColumnVisible)
  //   return this.rightTabbedView.setExtensionColumnVisible(this.extensionColumnVisible)
  // }

  // setSortBy(sortBy) {
  //   if (this.focusedView !== null) {
  //     return this.focusedView.setSortBy(sortBy)
  //   }
  // }

  serialize(state: State) {
    if (!state) {
      return
    }
    // TODO
    state.left = this.refs.leftTabbedView.serialize()
    state.right = this.refs.rightTabbedView.serialize()
    state.sizeColumnVisible = this.sizeColumnVisible
    state.dateColumnVisible = this.dateColumnVisible
    state.extensionColumnVisible = this.extensionColumnVisible
    // state.height = this.customHeight
  }
}

