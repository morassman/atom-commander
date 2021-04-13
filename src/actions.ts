import { Bookmark } from './bookmark-manager'
import { VDirectory, VFile } from './fs'
import { Main } from './main'
import { ContainerView, Snapshot } from './views/container-view'

// const Utils = require('./utils')
// const FileController = require('./controllers/file-controller')
// const DirectoryController = require('./controllers/directory-controller')
// const BookmarksView = require('./views/bookmarks-view')
// const DriveListView = require('./views/drive-list-view')
// const ProjectListView = require('./views/project-list-view')
// const ServersView = require('./views/servers-view')
// const AddBookmarkDialog = require('./dialogs/add-bookmark-dialog')
// const SelectDialog = require('./dialogs/select-dialog')
// const NewServerDialog = require('./dialogs/new-server-dialog')
// const {File, Directory, TextEditor} = require('atom')
// const ChildProcess = require('child_process')
// const shell = require('shell')

// import * as fsp from 'fs-plus'

export class Actions {

  constructor(public readonly main: Main) {
    this.main = main
  }

  getFocusedView(): ContainerView | null {
    let focusedView: ContainerView | null = this.main.mainView.focusedView

    if (!focusedView) {
      focusedView = this.main.mainView.getLeftView()
    }

    return focusedView
  }

  selectAll() {
    // TODO
    // const view = this.getFocusedView()

    // if (view != null) {
    //   view.selectAll()
    //   return view.requestFocus()
    // }
  }

  selectNone() {
    // TODO
    // const view = this.getFocusedView()

    // if (view != null) {
    //   view.selectNone()
    //   return view.requestFocus()
    // }
  }

  selectAdd() {
    return this.selectAddRemove(true)
  }

  selectRemove() {
    return this.selectAddRemove(false)
  }

  selectAddRemove(add: boolean) {
    // TODO
    // const view = this.getFocusedView()

    // if (view != null) {
    //   view.requestFocus()
    //   const dialog = new SelectDialog(this, view, add)
    //   return dialog.attach()
    // }
  }

  selectInvert() {
    // TODO
    // const view = this.getFocusedView()

    // if (view != null) {
    //   view.selectInvert()
    //   return view.requestFocus()
    // }
  }

  selectFolders() {
    // TODO
    // const view = this.getFocusedView()

    // if ((view == null)) {
    //   return
    // }

    // view.requestFocus()

    // return (() => {
    //   const result = []
    //   for (let itemView of Array.from(view.itemViews)) {
    //     if (itemView.isSelectable() && itemView.itemController instanceof DirectoryController) {
    //       result.push(itemView.select(true))
    //     } else {
    //       result.push(undefined)
    //     }
    //   }
    //   return result
    // })()
  }

  selectFiles() {
    // TODO
    // const view = this.getFocusedView()

    // if ((view == null)) {
    //   return
    // }

    // view.requestFocus()

    // return (() => {
    //   const result = []
    //   for (let itemView of Array.from(view.itemViews)) {
    //     if (itemView.isSelectable() && itemView.itemController instanceof FileController) {
    //       result.push(itemView.select(true))
    //     } else {
    //       result.push(undefined)
    //     }
    //   }
    //   return result
    // })()
  }

  // goHome() {
  //   return this.goDirectory(new Directory(fsp.getHomeDirectory()))
  // }

  // goRoot() {
  //   this.main.show(true)
  //   const view = this.getFocusedView()

  //   if ((view == null)) {
  //     return
  //   }

  //   let {
  //     directory
  //   } = view

  //   if ((directory == null)) {
  //     return
  //   }

  //   while (!directory.isRoot()) {
  //     const previousPath = directory.getPath()
  //     directory = directory.getParent()

  //     // Not sure if this is necessary, but it's just to prevent getting stuck
  //     // in case the root returns itself on certain platforms.
  //     if (previousPath === directory.getPath()) {
  //       break
  //     }
  //   }

  //   return this.goDirectory(directory)
  // }

  // goEditor() {
  //   const editor = atom.workspace.getActiveTextEditor()

  //   if (editor instanceof TextEditor) {
  //     if (editor.getPath() != null) {
  //       const file = this.main.getLocalFileSystem().getFile(editor.getPath())
  //       return this.goFile(file, false)
  //     }
  //   }
  // }

  // goPath(path, openIfFile?) {
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
  //     return this.goDirectory(directory)
  //   }
  // }

  goFile(file: VFile, open=false) {
    if (open == null) { open = false }
    this.main.show(true)
    const view = this.getFocusedView()

    if (view != null) {
      const snapShot: Snapshot = {
        name: file.getBaseName()
      }

      this.main.show(true)
      // view.requestFocus()
      view.openDirectory(file.getParent(), snapShot, () => {
        if (open) {
          file.open()
        }
      })
    }
  }

  goDirectory(directory: VDirectory) {
    this.main.show(true)
    const view = this.getFocusedView()

    if (view) {
      this.main.show(true)
      // view.requestFocus()
      view.openDirectory(directory)
    }
  }

  // goDrive(fromView) {
  //   let view
  //   if (fromView == null) { fromView = true }
  //   __guard__(this.main.getMainView(), x => x.hideMenuBar())
  //   return view = new DriveListView(this, fromView)
  // }

  // goProject(fromView) {
  //   if (fromView == null) { fromView = true }
  //   const projects = atom.project.getDirectories()

  //   if (projects.length === 0) {
  //     return
  //   }

  //   if (projects.length === 1) {
  //     return this.goDirectory(projects[0])
  //   } else {
  //     let view
  //     __guard__(this.main.getMainView(), x => x.hideMenuBar())
  //     return view = new ProjectListView(this, fromView)
  //   }
  // }

  goBookmark(bookmark: Bookmark) {
    const fileSystem = this.main.getFileSystemWithID(bookmark.pathDescription.fileSystemId)

    if (fileSystem === null) {
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

  // viewRefresh() {
  //   const view = this.getFocusedView()

  //   if (view != null) {
  //     return view.refreshDirectory()
  //   }
  // }

  // viewMirror() {
  //   return __guard__(this.main.getMainView(), x => x.mirror())
  // }

  // viewSwap() {
  //   return __guard__(this.main.getMainView(), x => x.swap())
  // }

  // compareFolders() {
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
  // }

  // compareFiles() {
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
  // }

  // bookmarksAddEditor() {
  //   const editor = atom.workspace.getActiveTextEditor()

  //   if (editor instanceof TextEditor) {
  //     if (editor.getPath() != null) {
  //       return this.bookmarksAddLocalFilePath(editor.getPath())
  //     }
  //   }
  // }

  // bookmarksAddLocalFilePath(path) {
  //   let file = this.main.getLocalFileSystem().getFile(path)

  //   // If the file is being watched then add a remote bookmark instead.
  //   const serverManager = this.main.getServerManager()
  //   const watcher = serverManager.getWatcherWithLocalFilePath(path)

  //   if (watcher !== null) {
  //     file = watcher.getFile()
  //   }

  //   const dialog = new AddBookmarkDialog(this.main, file.getBaseName(), file, false)
  //   return dialog.attach()
  // }

  // bookmarksAdd(fromView) {
  //   if (fromView == null) { fromView = true }
  //   const view = this.getFocusedView()

  //   if ((view == null)) {
  //     return
  //   }

  //   const itemView = view.getHighlightedItem()

  //   if ((itemView == null)) {
  //     return
  //   }

  //   let item = itemView.getItem()

  //   if (!itemView.isSelectable()) {
  //     item = view.directory
  //   }

  //   __guard__(this.main.getMainView(), x => x.hideMenuBar())
  //   const dialog = new AddBookmarkDialog(this.main, item.getBaseName(), item, fromView)
  //   return dialog.attach()
  // }

  // bookmarksRemove(fromView) {
  //   let view
  //   if (fromView == null) { fromView = true }
  //   __guard__(this.main.getMainView(), x => x.hideMenuBar())
  //   return view = new BookmarksView(this, false, fromView)
  // }

  // bookmarksOpen(fromView) {
  //   let view
  //   if (fromView == null) { fromView = true }
  //   __guard__(this.main.getMainView(), x => x.hideMenuBar())
  //   return view = new BookmarksView(this, true, fromView)
  // }

  // serversAdd(fromView) {
  //   if (fromView == null) { fromView = true }
  //   const view = this.getFocusedView()

  //   if ((view == null)) {
  //     return
  //   }

  //   __guard__(this.main.getMainView(), x => x.hideMenuBar())
  //   const dialog = new NewServerDialog(view)
  //   return dialog.attach()
  // }

  // serversRemove(fromView) {
  //   let view
  //   if (fromView == null) { fromView = true }
  //   __guard__(this.main.getMainView(), x => x.hideMenuBar())
  //   return view = new ServersView(this, "remove", fromView)
  // }

  // serversOpen(fromView) {
  //   let view
  //   if (fromView == null) { fromView = true }
  //   __guard__(this.main.getMainView(), x => x.hideMenuBar())
  //   return view = new ServersView(this, "open", fromView)
  // }

  // serversClose(fromView) {
  //   let view
  //   if (fromView == null) { fromView = true }
  //   __guard__(this.main.getMainView(), x => x.hideMenuBar())
  //   return view = new ServersView(this, "close", fromView)
  // }

  // serversCache(fromView) {
  //   let view
  //   if (fromView == null) { fromView = true }
  //   __guard__(this.main.getMainView(), x => x.hideMenuBar())
  //   return view = new ServersView(this, "cache", fromView)
  // }

  // serversEdit(fromView) {
  //   let view
  //   if (fromView == null) { fromView = true }
  //   __guard__(this.main.getMainView(), x => x.hideMenuBar())
  //   return view = new ServersView(this, "edit", fromView)
  // }

  // uploadFile() {
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
  // }

  // downloadFile() {
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
  // }

  // compareWithServer() {
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
  // }

  // openTerminal() {
  //   let command
  //   __guard__(this.main.getMainView(), x => x.hideMenuBar())
  //   const view = this.getFocusedView()

  //   if ((view == null)) {
  //     return
  //   }

  //   const {
  //     directory
  //   } = view
  //   let folder = directory.getPath()

  //   if (directory.isRemote()) {
  //     folder = view.getLastLocalPath()
  //   }

  //   if (process.platform === "darwin") {
  //     command = "open -a Terminal"
  //     command += " \""+folder+"\""
  //   } else if (process.platform === "win32") {
  //     command = "start C:\\Windows\\System32\\cmd.exe"
  //     command += " \""+folder+"\""
  //   } else {
  //     command = "/usr/bin/x-terminal-emulator"
  //   }

  //   const options = {}
  //   options.cwd = folder

  //   return ChildProcess.exec(command, options)
  // }

  // openFileSystem() {
  //   return this.openNative(true)
  // }

  openSystem() {
    this.openNative(false)
  }

  openNative(onlyShow: boolean) {
    // TODO
    // const view = this.getFocusedView()

    // if ((view == null)) {
    //   return
    // }

    // const {
    //   directory
    // } = view

    // if (directory.isRemote()) {
    //   atom.notifications.addWarning("This operation is only applicable to the local file system.")
    //   return
    // }

    // const itemView = view.getHighlightedItem()

    // if (itemView === null) {
    //   return
    // }

    // __guard__(this.main.getMainView(), x => x.hideMenuBar())

    // if (!itemView.isSelectable()) {
    //   shell.showItemInFolder(directory.getPath())
    //   return
    // }

    // const item = itemView.getItem()

    // if (onlyShow) {
    //   shell.showItemInFolder(item.getPath())
    //   return
    // }

    // if (item.isFile()) {
    //   return shell.openItem(item.getPath())
    // } else {
    //   return shell.showItemInFolder(item.getPath())
    // }
  }

  // toggleSizeColumn() {
  //   return __guard__(this.main.getMainView(), x => x.toggleSizeColumn())
  // }

  // toggleDateColumn() {
  //   return __guard__(this.main.getMainView(), x => x.toggleDateColumn())
  // }

  // toggleExtensionColumn() {
  //   return __guard__(this.main.getMainView(), x => x.toggleExtensionColumn())
  // }

  sortByName() {
    // TODO
    // return __guard__(this.main.getMainView(), x => x.setSortBy('name'))
  }

  sortByExtension() {
    // TODO
    // return __guard__(this.main.getMainView(), x => x.setSortBy('extension'))
  }

  sortBySize() {
    // TODO
    // return __guard__(this.main.getMainView(), x => x.setSortBy('size'))
  }

  sortByDate() {
    // TODO
    // return __guard__(this.main.getMainView(), x => x.setSortBy('date'))
  }

  sortByDefault() {
    // TODO
    // return __guard__(this.main.getMainView(), x => x.setSortBy(null))
  }
}

// function __guard__(value, transform) {
//   return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined
// }