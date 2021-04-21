const fse = require('fs-extra')
const PathUtil = require('path')

import * as fsp from 'fs-plus'
import { FTPFileSystem } from '../fs/ftp/ftp-filesystem'
import { SFTPFileSystem } from '../fs/ftp/sftp-filesystem'
import { RemoteFileManager } from './remote-file-manager'
import { CompositeDisposable } from 'atom'
import { VDirectory, VFile } from '../fs'
import { Watcher } from './watcher'
import { ServerManager } from './server-manager'
import { RemoteConfig } from '../fs/ftp/remote-config'
import { FTPConfig } from '../fs/ftp/ftp-config'
import { SFTPConfig } from '../fs/ftp/sftp-config'
import { RemoteFileSystem } from '../fs/ftp/remote-filesystem'

export class Server {

  fileSystem: RemoteFileSystem<RemoteConfig>

  localDirectoryName: string

  remoteFileManager: RemoteFileManager

  disposables: CompositeDisposable

  constructor(public readonly serverManager: ServerManager, public readonly config: RemoteConfig) {
    this.fileSystem = this.createFileSystem()
    this.localDirectoryName = this.fileSystem.getLocalDirectoryName()
    this.remoteFileManager = new RemoteFileManager(this)
    this.disposables = new CompositeDisposable()

    const taskManager = this.fileSystem.getTaskManager()

    if (taskManager) {
      this.disposables.add(taskManager.onUploadCount((change: number[]) => {
        this.serverManager.uploadCountChanged(change[0], change[1])
      }))

      this.disposables.add(taskManager.onDownloadCount((change: number[]) => {
        this.serverManager.downloadCountChanged(change[0], change[1])
      }))
    }
  }

  getServerManager() {
    return this.serverManager
  }

  getConfig() {
    return this.config
  }

  getName() {
    return this.fileSystem.getName()
  }

  getDisplayName() {
    return this.fileSystem.getDisplayName()
  }

  getUsername() {
    return this.fileSystem.getUsername()
  }

  serialize() {
    return this.fileSystem.getSafeConfig()
  }

  getLocalDirectoryPath() {
    return PathUtil.join(this.getServersPath(), this.localDirectoryName)
  }

  getCachePath() {
    return PathUtil.join(this.getLocalDirectoryPath(), 'cache')
  }

  getLocalDirectoryName() {
    return this.localDirectoryName
  }

  getRemoteFileManager() {
    return this.remoteFileManager
  }

  getFileSystem() {
    return this.fileSystem
  }

  dispose() {
    this.close()
    this.fileSystem.dispose()
    return this.disposables.dispose()
  }

  createFileSystem() {
    if (this.config.protocol === 'ftp') {
      return new FTPFileSystem(this, this.config as FTPConfig)
    }

    return new SFTPFileSystem(this, this.config as SFTPConfig)
  }

  isFTP(): boolean {
    return this.config.protocol === 'ftp'
  }

  isSFTP(): boolean {
    return this.config.protocol === 'sftp'
  }

  // Return a string that will be used when selecting a server from a list.
  getDescription(): string {
    return this.fileSystem.getDescription()
  }

  getRootDirectory(): VDirectory | undefined {
    return this.fileSystem.getDirectory('/')
  }

  getInitialDirectory(): VDirectory | undefined {
    return this.fileSystem.getInitialDirectory()
  }

  deleteLocalDirectory() {
    return fse.removeSync(this.getLocalDirectoryPath())
  }

  openFile(file: VFile) {
    this.remoteFileManager.openFile(file)
  }

  getOpenFileCount(): number {
    return this.remoteFileManager.getOpenFileCount()
  }

  // Return the number of files in the cache.
  getCacheFileCount(): number {
    let result = 0

    const onFile = (filePath: string) => {
      return result++
    }
    const onDirectory = (directoryPath: string) => {
      return true
    }

    fsp.traverseTreeSync(this.getCachePath(), onFile, onDirectory)

    return result
  }

  getTaskCount(): number {
    return this.fileSystem.getTaskCount()
  }

  getServersPath(): string {
    return PathUtil.join(fsp.getHomeDirectory(), '.atom-commander', 'servers')
  }

  getCachedFilePaths(): string[] {
    const result: string[] = []

    const onFile = (filePath: string) => {
      return result.push(filePath)
    }
    const onDirectory = (directoryPath: string) => {
      return true
    }

    fsp.traverseTreeSync(this.getCachePath(), onFile, onDirectory)

    return result
  }

  getWatcherWithLocalFilePath(localFilePath: string): Watcher | null {
    return this.remoteFileManager.getWatcherWithLocalFilePath(localFilePath)
  }

  // Return true if the connection to the server is open.
  isOpen(): boolean {
    return this.fileSystem.isConnected()
  }

  isClosed(): boolean {
    return !this.isOpen()
  }

  // Closes the connection to the server.
  close() {
    const taskManager = this.fileSystem.getTaskManager(false)
    taskManager?.clearTasks()
    this.fileSystem.disconnect()
    this.serverManager.serverClosed(this)
  }

}
