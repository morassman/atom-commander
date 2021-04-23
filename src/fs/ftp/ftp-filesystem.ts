const fs = require('fs')
const PathUtil = require('path').posix

import Client from 'ftp'

import { EntriesCallback, VFile, VItem } from '..'
import { Server } from '../../servers/server'
import { PathDescription } from '../path-description'
import { VDirectory } from '../vdirectory'
import { FTPConfig } from './ftp-config'
import { FTPDirectory } from './ftp-directory'
import { RemoteFileSystem } from './remote-filesystem'
import Utils from '../../utils'
import { FTPFile } from './ftp-file'
import { ErrorCallback, NewFileCallback, ReadStreamCallback } from '../vfilesystem'

export class FTPFileSystem extends RemoteFileSystem<FTPConfig> {

  client?: Client

  clientConfig: Client.Options

  constructor(server: Server, config: FTPConfig) {
    super(server, config)

    if (this.config.password && !this.config.passwordDecrypted) {
      this.config.password = Utils.decrypt(this.config.password, this.getDescription())
      this.config.passwordDecrypted = true
    }

    this.clientConfig = this.getClientConfig()
  }

  clone(): FTPFileSystem {
    const cloneFS = new FTPFileSystem(this.server, this.config)
    cloneFS.clientConfig = {...this.clientConfig}
    return cloneFS
  }

  connectImpl() {
    if (this.clientConfig.password && (this.clientConfig.password.length > 0)) {
      this.connectWithPassword(this.clientConfig.password)
    } else {
      let prompt = 'Enter password for '
      prompt += this.clientConfig.user
      prompt += '@'
      prompt += this.clientConfig.host
      prompt += ':'

      Utils.promptForPassword(prompt, (password: string) => {
        if (password) {
          this.connectWithPassword(password)
        } else {
          const err = {
            canceled: true,
            message: 'Incorrect credentials for '+this.clientConfig.host
          }
          this.disconnect(err)
        }
      })
    }
  }

  connectWithPassword(password: string) {
    this.client = new Client()

    this.client.on('ready', () => {
      this.clientConfig.password = password

      if (this.config.storePassword) {
        this.config.password = password
        this.config.passwordDecrypted = true
      }

      this.setConnected(true)
    })

    this.client.on('close', () => {
      this.disconnect()
    })

    this.client.on('error', (err: any) => {
      if (err.code === 530) {
        delete this.clientConfig.password
        atom.notifications.addWarning('Incorrect credentials for '+this.clientConfig.host)
        this.connectImpl()
      } else {
        this.disconnect(err)
      }
    })

    this.client.on('end', () => {
      this.disconnect()
    })

    const connectConfig: Client.Options = {
      ...this.clientConfig
    }

    connectConfig.password = password

    this.client.connect(connectConfig)
  }

  disconnectImpl() {
    this.client?.logout(() => {
      this.client?.end()
      this.client = undefined
    })

    this.setConnected(false)
  }

  getClientConfig(): Client.Options {
    return {
      host: this.config.host,
      port: this.config.port,
      user: this.config.user,
      password: this.config.password
    }
  }

  getSafeConfig(): FTPConfig {
    const result: FTPConfig = {
      ...this.config
    }

    if (this.config.storePassword) {
      if (result.password) {
        result.password = Utils.encrypt(result.password, this.getDescription())
      }
    } else {
      delete result.password
    }

    delete result.passwordDecrypted

    return result
  }

  getFile(path: string): FTPFile | undefined {
    return new FTPFile(this, false, path)
  }

  getDirectory(path: string): FTPDirectory | undefined {
    return new FTPDirectory(this, false, path)
  }

  getItemWithPathDescription(pathDescription: PathDescription): VItem | undefined {
    if (pathDescription.isFile) {
      return new FTPFile(this, pathDescription.isLink, pathDescription.path, pathDescription.name)
    }

    return new FTPDirectory(this, pathDescription.isLink, pathDescription.path)
  }

  getInitialDirectory(): FTPDirectory | undefined {
    return this.getDirectory(this.config.folder)
  }

  getURI(item: VItem): string {
    return this.config.protocol+'://' + PathUtil.join(this.config.host, item.getPath())
  }

  getPathUtil() {
    return PathUtil
  }

  getPathFromURI(uri: string): string | undefined {
    const root = this.config.protocol+'://'+this.config.host

    if (uri.substring(0, root.length) === root) {
      return uri.substring(root.length)
    }

    return undefined
  }

  renameImpl(oldPath: string, newPath: string, callback: ErrorCallback) {
    this.client?.rename(oldPath, newPath, (err: any) => {
      if (err) {
        callback(err.message)
      } else {
        callback(undefined)
      }
    })
  }

  makeDirectoryImpl(path: string, callback: ErrorCallback) {
    this.client?.mkdir(path, true, (err?: any) => {
      if (err) {
        callback(err.message)
      } else {
        callback(undefined)
      }
    })
  }

  deleteFileImpl(path: string, callback: ErrorCallback) {
    this.client?.delete(path, (err: any) => {
      if (err) {
        callback(err.message)
      } else {
        callback(undefined)
      }
    })
  }

  deleteDirectoryImpl(path: string, callback: ErrorCallback) {
    this.client?.rmdir(path, (err: any) => {
      if (err) {
        callback(err.message)
      } else {
        callback(undefined)
      }
    })
  }

  getHost(): string {
    return this.config.host
  }

  getDisplayName(): string {
    if (this.config.name && (this.config.name.trim().length > 0)) {
      return this.config.name
    }

    return this.config.host
  }

  getUsername(): string {
    return this.config.user
  }

  getLocalDirectoryName(): string {
    return this.config.protocol+'_'+this.config.host+'_'+this.config.port+'_'+this.config.user
  }

  downloadImpl(path: string, localPath: string, callback: ErrorCallback) {
    this.client?.get(path, (err: any, stream: any) => {
      if (err) {
        callback(err)
        return
      }

      stream.on('error', callback)
      stream.on('end', callback)
      stream.pipe(fs.createWriteStream(localPath))
    })
  }

  uploadImpl(localPath: string, path: string, callback: ErrorCallback) {
    this.client?.put(localPath, path, false, callback)
  }

  newFileImpl(path: string, callback: NewFileCallback) {
    const buffer = new Buffer('', 'utf8')

    this.client?.put(buffer, path, (err: Error) => {
      if (err) {
        callback(undefined, err)
      } else {
        callback(this.getFile(path), undefined)
      }
    })
  }

  openFile(file: VFile) {
    this.server.openFile(file)
  }

  createReadStreamImpl(path: string, callback: ReadStreamCallback) {
    this.client?.get(path, callback)
  }

  getDescription(): string {
    return this.config.protocol+'://'+this.config.host+':'+this.config.port
  }

  getEntriesImpl(directory: VDirectory, callback: EntriesCallback) {
    this.list(directory.getPath(), (err: any, entries: VItem[]) => {
      callback(directory, err, entries)
    })
  }

  list(path: string, callback: (err: any, entries: VItem[])=>void) {
    this.client?.list(path, (err: Error, entries: Client.ListingElement[]) => {
      if (err) {
        callback(err, [])
      } else {
        callback(undefined, this.wrapEntries(path, entries))
      }
    })
  }

  wrapEntries(path: string, entries: Client.ListingElement[]): VItem[] {
    const directories = []
    const files = []

    for (let entry of entries) {
      const wrappedEntry = this.wrapEntry(path, entry)

      if (wrappedEntry) {
        if (wrappedEntry.isFile()) {
          files.push(wrappedEntry)
        } else {
          directories.push(wrappedEntry)
        }
      }
    }

    Utils.sortItems(files)
    Utils.sortItems(directories)

    return directories.concat(files)
  }

  wrapEntry(path: string, entry: Client.ListingElement): VItem | undefined {
    if ((entry.name === '.') || (entry.name === '..')) {
      return undefined
    }

    let item: VItem | undefined = undefined

    if (entry.type === 'd') {
      item = new FTPDirectory(this, false, PathUtil.join(path, entry.name))
    } else if (entry.type === '-') {
      item = new FTPFile(this, false, PathUtil.join(path, entry.name))
    } else if (entry.type === 'l') {
      if (entry.target?.indexOf('/') !== -1) {
        item = new FTPDirectory(this, true, PathUtil.resolve(path, entry.target), entry.name)
        // item = new FTPDirectory(@, true, PathUtil.join(path, entry.target), entry.name)
      } else {
        item = new FTPFile(this, true, PathUtil.resolve(path, entry.target), entry.name)
      }
    }

    if (item) {
      item.modifyDate = entry.date
      item.size = entry.size
    }

    return item
  }

}
