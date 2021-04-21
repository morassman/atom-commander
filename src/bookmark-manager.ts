import { Disposable } from 'atom'
import { PathDescription } from './fs/path-description'
import { Main } from './main'

import * as fsp from 'fs-plus'
import { VFileSystem, VItem } from './fs'

export interface Bookmark {

  name: string

  pathDescription: PathDescription

}

export class BookmarkManager {

  bookmarks: Bookmark[]

  contextMenuDisposable: Disposable | null

  commandsDisposable: Disposable | null

  constructor(public readonly main: Main, public readonly state?: Bookmark[]) {
    this.bookmarks = []
    this.contextMenuDisposable = null
    this.commandsDisposable = null

    // if (state) {
    //   for (let bookmark of state) {
    //     if (Array.isArray(bookmark)) {
    //       bookmark = this.convertArrayBookmarkToObject(bookmark)
    //     }

    //     this.bookmarks.push(bookmark)
    //   }
    // }

    this.bookmarksChanged()
  }

  // convertArrayBookmarkToObject(bookmark: string[]): Bookmark {
    // const localFileSystem = this.main.getLocalFileSystem()

    // if (fsp.isFileSync(bookmark[1])) {
    //   item = localFileSystem.getFile(bookmark[1])
    // } else {
    //   item = localFileSystem.getDirectory(bookmark[1])
    // }

    // return {
    //   name: bookmark[0],
    //   pathDescription: item.getPathDescription()
    // }
  // }

  addBookmark(name: string, item: VItem) {
    const bookmark: Bookmark = {
      name,
      pathDescription: item.getPathDescription()
    }

    this.bookmarks.push(bookmark)
    this.main.saveState()
    this.bookmarksChanged()
  }

  // Adds multiple bookmarks.
  // bookmarks : Array of bookmarks to add.
  addBookmarks(bookmarks: Bookmark[]) {
    this.bookmarks = this.bookmarks.concat(bookmarks)
    this.main.saveState()
    this.bookmarksChanged()
  }

  removeBookmark(bookmark: Bookmark, save=true) {
    const index = this.bookmarks.indexOf(bookmark)

    if (index >= 0) {
      this.bookmarks.splice(index, 1)
      this.bookmarksChanged()
    }

    if (save) {
      this.main.saveState()
    }
  }

  getBookmarksWithFileSystemId(fileSystemId: string) {
    const result = []

    for (let bookmark of this.bookmarks) {
      if (bookmark.pathDescription.fileSystemId === fileSystemId) {
        result.push(bookmark)
      }
    }

    return result
  }

  fileSystemRemoved(fileSystem: VFileSystem) {
    const bs = this.getBookmarksWithFileSystemId(fileSystem.getID())

    if (bs.length === 0) {
      return
    }

    for (let b of bs) {
      this.removeBookmark(b, false)
    }

    return this.main.saveState()
  }

  bookmarksChanged() {
    // const commands = {}
    // const menuItems = []
    // let index = 0

    // for (let bookmark of Array.from(this.bookmarks)) {
    //   index++
    //   ((index, bookmark) => {
    //     const commandName = 'atom-commander:bookmark-' + index
    //     commands[commandName] = () => this.openBookmark(bookmark)
    //     return menuItems.push({
    //       label: bookmark.name,
    //       command: commandName
    //     })
    //   })(index, bookmark)
    // }

    // if (index > 0) {
    //   menuItems.push({ type: 'separator' })
    // }

    // menuItems.push({ label: 'Add', command: 'atom-commander:add-bookmark' })
    // menuItems.push({ label: 'Remove', command: 'atom-commander:remove-bookmark' })
    // menuItems.push({ label: 'Open', command: 'atom-commander:open-bookmark' })

    // if (this.contextMenuDisposable != null) {
    //   this.contextMenuDisposable.dispose()
    // }

    // if (this.commandsDisposable != null) {
    //   this.commandsDisposable.dispose()
    // }

    // this.contextMenuDisposable = atom.contextMenu.add({
    //   '.atom-commander': [{
    //     label: 'Bookmarks',
    //     submenu: menuItems
    //   }]
    // })

    // return this.commandsDisposable = atom.commands.add('atom-workspace', commands)
  }

  openBookmark(bookmark: Bookmark) {
    this.main.actions.goBookmark(bookmark)
  }

  serialize() {
    return this.bookmarks
  }

}
