const fsp = require('fs-plus')
const fse = require('fs-extra')
const PathUtil = require('path')
import { Watcher } from './watcher'
import { CompositeDisposable, Directory, File, NotificationOptions, TextEditor } from 'atom'
import { Server } from './server'
import { VFile } from '../fs'

export class RemoteFileManager {

  watchers: Watcher[]

  disposables: CompositeDisposable

  constructor(private readonly server: Server) {
    this.watchers = []
    this.disposables = new CompositeDisposable()
    this.disposables.add(atom.workspace.observeTextEditors(textEditor => {
      this.textEditorAdded(textEditor)
    })
    )
  }

  getServer() {
    return this.server
  }

  textEditorAdded(textEditor: TextEditor) {
    const cachePath = this.server.getCachePath()
    const localFilePath = textEditor.getPath()
    const dir = new Directory(cachePath)

    if (!localFilePath) {
      return
    }

    // Check to see if the file is in the cache directory.
    if (!dir.contains(localFilePath)) {
      return
    }

    // Ensure that the file exists. An editor can exist for a file path if Atom
    // was closed with the file open, but then the file was deleted before Atom
    // was launched again.
    if (!fsp.isFileSync(localFilePath)) {
      return
    }

    // See if the file is already being watched. This will be the case if the
    // file was opened directly from the remote file system instead of locally.
    if (this.getWatcherWithLocalFilePath(localFilePath)) {
      return
    }   

    let remotePath = dir.relativize(localFilePath)
    remotePath = remotePath.split("\\").join("/")

    const fileSystem = this.server.getFileSystem()
    const file = fileSystem.getFile("/" + remotePath)

    if (file) {
      const watcher = this.addWatcher(cachePath, localFilePath, file, textEditor)
      watcher.setOpenedRemotely(false)
    }
  }

  openFile(file: VFile) {
    const cachePath = this.server.getCachePath()
    const localFilePath = PathUtil.join(cachePath, file.getPath())

    const pane = atom.workspace.paneForURI(localFilePath)

    if (pane) {
      pane.activateItemForURI(localFilePath)
      return
    }

    // See if the file is already in the cache.
    if (fsp.isFileSync(localFilePath)) {
      let detail = "The file " + file.getURI() + " is already in the cache. "
      detail += "Opening the remote file will replace the one in the cache.\n"
      detail += "Would you like to open the cached file instead?"

      atom.confirm({
        message: "Open cached file",
        detail,
        buttons: ["Cancel", "No", "Yes"]
      }, (response: number) => {
        if (response === 1) {
          this.downloadAndOpen(file, cachePath, localFilePath)
        } else if (response === 2) {
          atom.workspace.open(localFilePath)
        }
      })
    } else {
      this.downloadAndOpen(file, cachePath, localFilePath)
    }
  }

  downloadAndOpen(file: VFile, cachePath: string, localFilePath: string) {
    fse.ensureDirSync(PathUtil.dirname(localFilePath))

    file.download(localFilePath, err => {
      if (err) {
        this.handleDownloadError(file, err)
        return
      }

      atom.workspace.open(localFilePath).then(textEditor => {
        let watcher = this.getWatcherWithLocalFilePath(localFilePath)

        if (!watcher) {
          watcher = this.addWatcher(cachePath, localFilePath, file, textEditor as TextEditor)
        }

        watcher.setOpenedRemotely(true)
        this.server.getFileSystem().fileOpened(file)
      })
    })
  }

  handleDownloadError(file: VFile, err: any) {
    let message = "The file " + file.getPath() + " could not be downloaded."

    if (err.message) {
      message += "\nReason : " + err.message
    }

    const options: NotificationOptions = {
      dismissable: true,
      detail: message
    }

    atom.notifications.addWarning("Unable to download file.", options)
  }

  getWatcherWithLocalFilePath(localFilePath: string): Watcher | undefined {
    for (let watcher of this.watchers) {
      if (watcher.getLocalFilePath() === localFilePath) {
        return watcher
      }
    }

    return undefined
  }

  addWatcher(cachePath: string, localFilePath: string, file: VFile, textEditor: TextEditor) {
    const watcher = new Watcher(this, cachePath, localFilePath, file, textEditor)
    this.watchers.push(watcher)
    return watcher
  }

  removeWatcher(watcher: Watcher) {
    watcher.destroy()
    const index = this.watchers.indexOf(watcher)

    if (index >= 0) {
      this.watchers.splice(index, 1)
    }
  }

  getOpenFileCount(): number {
    return this.watchers.length
  }

  destroy() {
    this.disposables.dispose()
    this.watchers.forEach(watcher => watcher.destroy())
  }

}
