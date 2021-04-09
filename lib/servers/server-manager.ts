import { RemoteConfig } from '../fs/ftp/remote-config'
import { Main, main } from '../main'
import { Server } from './server'
import { Watcher } from './watcher'

const fsp = require('fs-plus')

export class ServerManager {

  servers: Server[]
  uploadCount: number
  downloadCount: number

  constructor(public readonly main: Main, state: RemoteConfig[]) {
    this.servers = []
    this.uploadCount = 0
    this.downloadCount = 0

    if (state != null) {
      for (let config of state) {
        this.addServer(config, false)
      }
    }
  }

  getUploadCount(): number {
    return this.uploadCount
  }

  getDownloadCount(): number {
    return this.downloadCount
  }

  addServer(config: RemoteConfig, save=true) {
    const server = new Server(this, config)
    this.servers.push(server)

    if (save) {
      main.saveState()
    }

    return server
  }

  removeServer(server: Server) {
    return this.removeServerImpl(server, true, true)
  }

  removeServerImpl(server: Server, deleteLocalDirectory: boolean, save: boolean) {
    const index = this.servers.indexOf(server)

    if (index >= 0) {
      this.servers.splice(index, 1)
    }

    const fileSystem = server.getFileSystem()

    if (deleteLocalDirectory) {
      server.deleteLocalDirectory()
    }

    server.dispose()
    main.fileSystemRemoved(fileSystem)

    if (save) {
      return main.saveState()
    }
  }

  // Changes the given server's configuration. This is called after
  // a server's config has been edited. The existing server will be
  // removed, but its cache will not be deleted. The name of the
  // cache's folder will be renamed based on the new config and
  // a new server will be created with the new config.
  changeServerConfig(server: Server, config: RemoteConfig) {
    // By removing the server its bookmarks will be removed as well.
    // It is therefore necessary to get its bookmarks before removing it.
    const oldFSID = server.getFileSystem().getID()
    const bookmarks = main.bookmarkManager.getBookmarksWithFileSystemId(oldFSID)

    this.removeServerImpl(server, false, false)
    const newServer = this.addServer(config, false)

    const oldPath = server.getLocalDirectoryPath()
    const newPath = newServer.getLocalDirectoryPath()

    if (fsp.existsSync(oldPath) && (oldPath !== newPath)) {
      fsp.moveSync(oldPath, newPath)
    }

    // Update bookmarks.
    const newFS = newServer.getFileSystem()

    for (let bookmark of Array.from(bookmarks)) {
      const item = newFS.getItemWithPathDescription(bookmark.pathDescription)
      
      if (item) {
        bookmark.pathDescription = item.getPathDescription()
      }
    }

    main.bookmarkManager.addBookmarks(bookmarks)
    return main.saveState()
  }

  getServers() {
    return this.servers
  }

  getServerCount() {
    return this.servers.length
  }

  getServerWithLocalDirectoryName(localDirectoryName: string) {
    for (let server of this.servers) {
      if (server.getLocalDirectoryName() === localDirectoryName) {
        return server
      }
    }

    return null
  }

  getFileSystemWithID(fileSystemId: string) {
    for (let server of this.servers) {
      const fileSystem = server.getFileSystem()

      if (fileSystem.getID() === fileSystemId) {
        return fileSystem
      }
    }

    return null
  }

  getWatcherWithLocalFilePath(localFilePath: string): Watcher | null {
    for (let server of this.servers) {
      const watcher = server.getWatcherWithLocalFilePath(localFilePath)

      if (watcher !== null) {
        return watcher
      }
    }

    return null
  }

  uploadCountChanged(old: number, current: number) {
    this.uploadCount += current - old
    main.refreshStatus()
  }

  downloadCountChanged(old: number, current: number) {
    this.downloadCount += current - old
    main.refreshStatus()
  }

  serverClosed(server: Server) {
    main.serverClosed(server)
  }

  dispose() {
    this.servers.forEach((server) => server.dispose())
  }

  serialize() {
    const state = []

    for (let server of this.servers) {
      state.push(server.serialize())
    }

    return state
  }

}
