import { Directory } from 'atom'
import { Bookmark } from './bookmark-manager'
import { VDirectory, VFile, VItem } from './fs'
import { Main } from './main'
import { ContainerView, Snapshot } from './views/container-view'
import { showAddBookmarkModal, showListDriveModal, showListProjectsModal, showOpenBookmarkModal, showRemoveBookmarkModal, showSelectModal } from './views/modals'

// const Utils = require('./utils')
// const BookmarksView = require('./views/bookmarks-view')
// const DriveListView = require('./views/drive-list-view')
// const ProjectListView = require('./views/project-list-view')
// const ServersView = require('./views/servers-view')
// const AddBookmarkDialog = require('./dialogs/add-bookmark-dialog')
// const SelectDialog = require('./dialogs/select-dialog')
// const NewServerDialog = require('./dialogs/new-server-dialog')
// const {File, Directory, TextEditor} = require('atom')
// const ChildProcess = require('child_process')

import ChildProcess from 'child_process'
import fsp from 'fs-plus'

const { shell } = require('electron')

export class Actions {
  
  constructor(public readonly main: Main) {
    this.main = main
  }

  hideMenuBar() {
    this.main.getMainView().hideMenuBar()
  }

  getFocusedView(): ContainerView | undefined {
    let focusedView: ContainerView | undefined = this.main.getMainView().focusedView

    if (!focusedView) {
      focusedView = this.main.getMainView().getLeftView()
    }

    return focusedView
  }

  selectAll() {
    const view = this.getFocusedView()

    if (view) {
      view.selectAll()
      view.requestFocus()
    }
  }

  selectNone() {
    const view = this.getFocusedView()

    if (view) {
      view.selectNone()
      view.requestFocus()
    }
  }

  selectAdd() {
    this.selectAddRemove(true)
  }

  selectRemove() {
    this.selectAddRemove(false)
  }

  selectAddRemove(add: boolean) {
    this.hideMenuBar()
    const view = this.getFocusedView()

    if (view) {
      view.requestFocus()
      showSelectModal(view, add)
    }
  }

  selectInvert() {
    const view = this.getFocusedView()

    if (view) {
      view.selectInvert()
      view.requestFocus()
    }
  }

  selectFolders() {
    const view = this.getFocusedView()

    if (!view) {
      return
    }

    view.requestFocus()

    for (let itemView of view.itemViews) {
      if (itemView.isSelectable() && itemView.item.isDirectory()) {
        itemView.select(true)
      }
    }
  }

  selectFiles() {
    const view = this.getFocusedView()

    if (!view) {
      return
    }

    view.requestFocus()

    for (let itemView of view.itemViews) {
      if (itemView.isSelectable() && itemView.item.isFile()) {
        itemView.select(true)
      }
    }
  }

  goHome() {
    this.goDirectory(new Directory(fsp.getHomeDirectory()))
  }

  goRoot() {
    this.main.show(true)
    const view = this.getFocusedView()

    if (!view) {
      return
    }

    let { directory } = view

    if (!directory) {
      return
    }

    while (directory && !directory.isRoot()) {
      const previousPath = directory.getPath()
      directory = directory.getParent()

      // Not sure if this is necessary, but it's just to prevent getting stuck
      // in case the root returns itself on certain platforms.
      if (directory && (previousPath === directory.getPath())) {
        break
      }
    }

    if (directory) {
      this.goDirectory(directory)
    }
  }

  goEditor() {
    const editor = atom.workspace.getActiveTextEditor()

    if (editor) {
      const path = editor.getPath()

      if (path) {
        const file = this.main.getLocalFileSystem().getFile(path)
        this.goFile(file, false)
      }
    }
  }

  // goPath(path: string, openIfFile: boolean) {
  //   if (fsp.isDirectorySync(path)) {
  //     this.goDirectory(new Directory(path))
  //     return
  //   }

  //   const file = new File(path)

  //   if (fsp.isFileSync(path)) {
  //     this.goFile(file, openIfFile)
  //     return
  //   }

  //   const directory = file.getParent()

  //   if (fsp.isDirectorySync(directory.getPath())) {
  //     this.goDirectory(directory)
  //   }
  // }

  goFile(file: VFile, open=false) {
    this.main.show(true)
    const view = this.getFocusedView()

    if (view != null) {
      const snapShot: Snapshot = {
        name: file.getBaseName()
      }

      this.main.show(true)
      view.requestFocus()

      const parent = file.getParent()

      if (parent) {
        view.openDirectory(parent, snapShot, () => {
          if (open) {
            file.open()
          }
        })
      }
    }
  }

  goDirectory(directory: VDirectory | Directory) {
    this.main.show(true)
    const view = this.getFocusedView()

    if (view) {
      this.main.show(true)
      view.requestFocus()
      view.openDirectory(directory)
    }
  }

  goDrive(fromView=true) {
    this.hideMenuBar()
    showListDriveModal(directory => {
      if (directory) {
        this.goDirectory(directory)
      } else if (fromView) {
        this.main.mainView.refocusLastView()
      }

      return false
    })
  }

  goProject(fromView=true) {
    const projects = atom.project.getDirectories()

    if (projects.length === 0) {
      return
    }

    if (projects.length === 1) {
      this.goDirectory(projects[0])
    } else {
      this.hideMenuBar()

      showListProjectsModal((project?: Directory) => {
        if (project) {
          this.goDirectory(project)
        }

        if (fromView) {
          this.main.mainView.refocusLastView()
        }

        return false
      })
    }
  }

  goBookmark(bookmark: Bookmark) {
    const fileSystem = this.main.getFileSystemWithID(bookmark.pathDescription.fileSystemId)

    if (!fileSystem) {
      return
    }

    const item = fileSystem.getItemWithPathDescription(bookmark.pathDescription)

    if (!item) {
      return
    }

    if (item.isFile()) {
      this.goFile(item as VFile, true)
    } else {
      this.goDirectory(item as VDirectory)
    }
  }

  viewRefresh() {
    const view = this.getFocusedView()

    if (view) {
      view.refreshDirectory()
    }
  }

  viewMirror() {
    this.main.getMainView().mirror()
  }

  viewSwap() {
    this.main.getMainView().swap()
  }

  compareFolders() {
    // TODO
  //   let itemView
  //   this.main.getMainView().hideMenuBar()
  //   const leftView = __guard__(this.main.getMainView(), x => x.getLeftView())
  //   const rightView = __guard__(this.main.getMainView(), x1 => x1.getRightView())

  //   if ((leftView == null) || (rightView == null)) {
  //     return
  //   }

  //   leftView.selectNone()
  //   rightView.selectNone()

  //   for (itemView of Array.from(leftView.itemViews)) {
  //     if (rightView.getItemViewWithName(itemView.getName()) === null) {
  //       itemView.select(true)
  //     }
  //   }

  //   return (() => {
  //     const result = []
  //     for (itemView of Array.from(rightView.itemViews)) {
  //       if (leftView.getItemViewWithName(itemView.getName()) === null) {
  //         result.push(itemView.select(true))
  //       } else {
  //         result.push(undefined)
  //       }
  //     }
  //     return result
  //   })()
  }

  compareFiles() {
    // TODO
  //   this.main.getMainView().hideMenuBar()
  //   const leftView = __guard__(this.main.getMainView(), x => x.getLeftView())
  //   const rightView = __guard__(this.main.getMainView(), x1 => x1.getRightView())

  //   if ((leftView == null) || (rightView == null)) {
  //     return
  //   }

  //   const leftViewItem = leftView.getHighlightedItem()

  //   if (leftViewItem === null) {
  //     return
  //   }

  //   const rightViewItem = rightView.getHighlightedItem()

  //   if (rightViewItem === null) {
  //     return
  //   }

  //   if (!(leftViewItem.itemController instanceof FileController)) {
  //     return
  //   }

  //   if (!(rightViewItem.itemController instanceof FileController)) {
  //     return
  //   }

  //   // leftViewItem = Utils.getFirstFileViewItem(leftView.getSelectedItemViews(true))
  //   //
  //   // if (leftViewItem == null)
  //   //   return
  //   //
  //   // rightViewItem = Utils.getFirstFileViewItem(rightView.getSelectedItemViews(true))
  //   //
  //   // if (rightViewItem == null)
  //   //   return

  //   this.main.getMainView().hideMenuBar()

  //   const leftFile = leftViewItem.itemController.getFile()
  //   const rightFile = rightViewItem.itemController.getFile()
  //   const title = "Diff: "+leftFile.getBaseName()+" | "+rightFile.getBaseName()
  //   const tooltip = leftFile.getPath()+" | "+rightFile.getPath()

  //   return Utils.compareFiles(title, tooltip, leftFile, rightFile)
  }

  bookmarksAddEditor() {
    const editor = atom.workspace.getActiveTextEditor()
    const path = editor ? editor.getPath() : null

    if (path) {
      this.bookmarksAddLocalFilePath(path)
    }
  }

  bookmarksAddLocalFilePath(path: string) {
    let file: VFile = this.main.getLocalFileSystem().getFile(path)

    // If the file is being watched then add a remote bookmark instead.
    const serverManager = this.main.getServerManager()
    const watcher = serverManager.getWatcherWithLocalFilePath(path)

    if (watcher) {
      file = watcher.getFile()
    }

    showAddBookmarkModal(file, false)
  }

  bookmarksAdd(fromView=true) {
    const view = this.getFocusedView()

    if (!view) {
      return
    }

    const itemView = view.getHighlightedItem()

    if (!itemView) {
      return
    }

    let item: VItem | undefined = itemView.getItem()

    if (!itemView.isSelectable()) {
      item = view.directory
    }

    this.main.getMainView().hideMenuBar()

    if (item) {
      showAddBookmarkModal(item, fromView)
    }
  }

  bookmarksRemove(fromView=true) {
    this.main.getMainView().hideMenuBar()
    showRemoveBookmarkModal(fromView)
  }

  bookmarksOpen(fromView=true) {
    this.main.getMainView().hideMenuBar()
    showOpenBookmarkModal(fromView)
  }

  serversAdd(fromView=true) {
    // TODO
  //   const view = this.getFocusedView()

  //   if ((view == null)) {
  //     return
  //   }

  //   __guard__(this.main.getMainView(), x => x.hideMenuBar())
  //   const dialog = new NewServerDialog(view)
  //   return dialog.attach()
  }

  serversRemove(fromView=true) {
  //   let view
  //   __guard__(this.main.getMainView(), x => x.hideMenuBar())
  //   return view = new ServersView(this, "remove", fromView)
  }

  serversOpen(fromView=true) {
    // TODO
  //   let view
  //   __guard__(this.main.getMainView(), x => x.hideMenuBar())
  //   return view = new ServersView(this, "open", fromView)
  }

  serversClose(fromView=true) {
    // TODO
  //   let view
  //   if (fromView == null) { fromView = true }
  //   __guard__(this.main.getMainView(), x => x.hideMenuBar())
  //   return view = new ServersView(this, "close", fromView)
  }

  serversCache(fromView=true) {
    // TODO
  //   let view
  //   if (fromView == null) { fromView = true }
  //   __guard__(this.main.getMainView(), x => x.hideMenuBar())
  //   return view = new ServersView(this, "cache", fromView)
  }

  serversEdit(fromView=true) {
  //   let view
  //   __guard__(this.main.getMainView(), x => x.hideMenuBar())
  //   return view = new ServersView(this, "edit", fromView)
  }

  uploadFile() {
    // TODO
  //   const editor = atom.workspace.getActiveTextEditor()

  //   if (!(editor instanceof TextEditor)) {
  //     return
  //   }

  //   if ((editor.getPath() == null)) {
  //     return
  //   }

  //   const serverManager = this.main.getServerManager()
  //   const watcher = serverManager.getWatcherWithLocalFilePath(editor.getPath())

  //   if (watcher === null) {
  //     atom.notifications.addInfo(editor.getPath()+" doesn't have a server associated with it.")
  //     return
  //   }

  //   editor.save()

  //   // Only upload if saving will not automatically cause it to be uploaded.
  //   if (!atom.config.get("atom-commander.uploadOnSave")) {
  //     return watcher.upload()
  //   }
  }

  downloadFile() {
    // TODO
  //   const editor = atom.workspace.getActiveTextEditor()

  //   if (!(editor instanceof TextEditor)) {
  //     return
  //   }

  //   if ((editor.getPath() == null)) {
  //     return
  //   }

  //   const serverManager = this.main.getServerManager()
  //   const watcher = serverManager.getWatcherWithLocalFilePath(editor.getPath())

  //   if (watcher === null) {
  //     atom.notifications.addInfo(editor.getPath()+" doesn't have a server associated with it.")
  //     return
  //   }

  //   const response = atom.confirm({
  //     message: "Download",
  //     detailedMessage: "Replace the cached file with the remote one?",
  //     buttons: ["No", "Yes"]})

  //   if (response === 0) {
  //     return
  //   }

  //   const file = watcher.getFile()
  //   return file.download(editor.getPath(), err => {
  //     if (err != null) {
  //       return Utils.showErrorWarning("Download failed", "Error downloading "+file.getURI(), null, err, true)
  //     } else {
  //       return atom.notifications.addSuccess("Downloaded "+file.getURI())
  //     }
  //   })
  }

  compareWithServer() {
    // TODO
  //   const editor = atom.workspace.getActiveTextEditor()

  //   if (!(editor instanceof TextEditor)) {
  //     return
  //   }

  //   if ((editor.getPath() == null)) {
  //     return
  //   }

  //   const serverManager = this.main.getServerManager()
  //   const watcher = serverManager.getWatcherWithLocalFilePath(editor.getPath())

  //   if (watcher === null) {
  //     atom.notifications.addInfo(editor.getPath()+" doesn't have a server associated with it.")
  //     return
  //   }

  //   const title = "Diff: "+editor.getTitle()+" | server"
  //   const tooltip = watcher.getFile().getPath()
  //   return Utils.compareFiles(title, tooltip, editor.getText(), watcher.getFile())
  }

  openTerminal() {
    this.main.getMainView().hideMenuBar()
    const view = this.getFocusedView()

    if (!view) {
      return
    }

    const { directory } = view

    if (!directory) {
      return
    }

    let folder: string | undefined = directory.getPath()

    if (directory.isRemote()) {
      folder = view.getLastLocalPath()
    }

    if (!folder) {
      folder = fsp.getHomeDirectory()
    }

    let command

    if (process.platform === "darwin") {
      command = "open -a Terminal"
      command += " \""+folder+"\""
    } else if (process.platform === "win32") {
      command = "start C:\\Windows\\System32\\cmd.exe"
      command += " \""+folder+"\""
    } else {
      command = "/usr/bin/x-terminal-emulator"
    }

    const options = {
      cwd: folder
    }

    ChildProcess.exec(command, options)
  }

  openFileSystem() {
    this.openNative(true)
  }

  openSystem() {
    this.openNative(false)
  }

  openNative(onlyShow: boolean) {
    console.log('openNative : '+onlyShow)
    console.log(shell)
    const view = this.getFocusedView()

    if (!view) {
      return
    }

    const { directory } = view

    if (!directory) {
      return
    }

    if (directory.isRemote()) {
      atom.notifications.addWarning("This operation is only applicable to the local file system.")
      return
    }

    const itemView = view.getHighlightedItem()

    if (!itemView) {
      return
    }

    this.hideMenuBar()

    if (!itemView.isSelectable()) {
      shell.showItemInFolder(directory.getPath())
      return
    }

    const item = itemView.getItem()

    if (onlyShow) {
      shell.showItemInFolder(item.getPath())
      return
    }

    if (item.isFile()) {
      return shell.openPath(item.getPath())
    } else {
      return shell.showItemInFolder(item.getPath())
    }
  }

  toggleSizeColumn() {
    this.main.getMainView().toggleSizeColumn()
  }

  toggleDateColumn() {
    this.main.getMainView().toggleDateColumn()
  }

  toggleExtensionColumn() {
    this.main.getMainView().toggleExtensionColumn()
  }

  sortByName() {
    this.main.getMainView().setSortBy('name')
  }

  sortByExtension() {
    this.main.getMainView().setSortBy('extension')
  }

  sortBySize() {
    this.main.getMainView().setSortBy('size')
  }

  sortByDate() {
    this.main.getMainView().setSortBy('date')
  }

  sortByDefault() {
    this.main.getMainView().setSortBy()
  }
}
