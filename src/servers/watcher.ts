const fs = require('fs')
import fsp from 'fs-plus'

import { CompositeDisposable, NotificationOptions, TextEditor } from 'atom'
import { VFile } from '../fs'
import { RemoteFileManager } from './remote-file-manager'

export class Watcher {

  uploading: number

  changesSaved: boolean

  uploadFailed: boolean

  destroyed: boolean

  openedRemotely: boolean

  openTime: Date

  saveTime?: Date

  uploadTime?: Date

  disposables: CompositeDisposable

  serverName: string

  constructor(private readonly remoteFileManager: RemoteFileManager, private readonly cachePath: string,
    private readonly localFilePath: string, private readonly file: VFile, private readonly textEditor: TextEditor) {
    this.uploading = 0
    this.changesSaved = false
    this.uploadFailed = false
    this.destroyed = false
    this.openedRemotely = true
    this.openTime = this.getModifiedTime()
    this.disposables = new CompositeDisposable()
    this.serverName = this.remoteFileManager.getServer().getDisplayName()

    this.disposables.add(this.textEditor.onDidSave(event => {
      this.fileSaved()
    }))

    this.disposables.add(this.textEditor.onDidDestroy(() => {
      this.destroyed = true
      if (this.uploading === 0) {
        this.removeWatcher()
      }
    }))
  }

  setOpenedRemotely(openedRemotely: boolean) {
    this.openedRemotely = openedRemotely
  }

  getFile(): VFile {
    return this.file
  }

  getLocalFilePath(): string {
    return this.localFilePath
  }

  getModifiedTime(): Date {
    const stat = fs.statSync(this.localFilePath)
    return stat.mtime.getTime()
  }

  fileSaved() {
    this.saveTime = this.getModifiedTime()

    if (atom.config.get('atom-commander.uploadOnSave')) {
      this.upload()
    }
  }

  upload() {
    this.uploading++
    this.file.upload(this.localFilePath, err => {
      this.uploading--
      this.uploadCallback(err)
    })
  }

  uploadCallback(err: any) {
    this.uploadFailed = err ? true : false

    if (this.uploadFailed) {
      let message = this.file.getPath() + ' could not be uploaded to ' + this.serverName

      if (err.message) {
        message += '\nReason : ' + err.message
      }

      message += '\nThe file has been cached and can be uploaded later.'

      const options: NotificationOptions = {
        dismissable: true,
        detail: message
      }
      atom.notifications.addWarning('Unable to upload file.', options)
    } else {
      atom.notifications.addSuccess(this.file.getPath() + ' uploaded to ' + this.serverName)
      this.uploadTime = this.getModifiedTime()
    }

    if (this.destroyed) {
      this.removeWatcher()
    }
  }

  removeWatcher() {
    if (this.shouldDeleteFile()) {
      fsp.removeSync(this.localFilePath)
    }

    this.remoteFileManager.removeWatcher(this)
  }

  shouldDeleteFile() {
    const removeOnClose = atom.config.get('atom-commander.removeOnClose')

    if (!removeOnClose) {
      return false
    }

    if (this.openedRemotely) {
      return this.shouldDeleteRemoteOpenedFile()
    }

    return this.shouldDeleteLocalOpenedFile()
  }

  shouldDeleteRemoteOpenedFile() {
    if (!this.saveTime) {
      return true
    }

    if (!this.uploadTime) {
      return false
    }

    return this.uploadTime === this.saveTime
  }

  shouldDeleteLocalOpenedFile() {
    if (!this.uploadTime) {
      return false
    }

    if (!this.saveTime) {
      return this.uploadTime === this.openTime
    }

    return this.uploadTime === this.saveTime
  }

  destroy() {
    this.disposables.dispose()
  }

}
