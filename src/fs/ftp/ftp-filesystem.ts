const fs = require('fs')
const FTPClient = require('ftp')
const PathUtil = require('path').posix
const VFileSystem = require('../vfilesystem')
const FTPFile = require('./ftp-file')
const FTPDirectory = require('./ftp-directory')
const Utils = require('../../utils')

import { EntriesCallback, VFile, VItem } from '..'
import { Server } from '../../servers/server'
import { PathDescription } from '../path-description'
import { VDirectory } from '../vdirectory'
import { FTPConfig } from './ftp-config'
import { RemoteFileSystem } from './remote-filesystem'

export class FTPFileSystem extends RemoteFileSystem<FTPConfig> {

  client: any

  clientConfig: any

  constructor(server: Server, config: FTPConfig) {
    super(server, config)
    this.client = null

    if (this.config.password && !this.config.passwordDecrypted) {
      this.config.password = Utils.decrypt(this.config.password, this.getDescription())
      this.config.passwordDecrypted = true
    }

    this.clientConfig = this.getClientConfig()
  }

  clone(): FTPFileSystem {
    const cloneFS = new FTPFileSystem(this.server, this.config)
    cloneFS.clientConfig = this.clientConfig
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
    this.client = new FTPClient()

    this.client.on('ready', () => {
      this.clientConfig.password = password

      if (this.config.storePassword) {
        this.config.password = password
        this.config.passwordDecrypted = true
      }

      return this.setConnected(true)
    })

    this.client.on('close', () => {
      return this.disconnect()
    })

    this.client.on('error', (err: any) => {
      if (err.code === 530) {
        delete this.clientConfig.password
        atom.notifications.addWarning('Incorrect credentials for '+this.clientConfig.host)
        return this.connectImpl()
      } else {
        return this.disconnect(err)
      }
    })

    this.client.on('end', () => {
      return this.disconnect()
    })

    const connectConfig: any = {}

    for (let key in this.clientConfig) {
      const val = this.clientConfig[key]
      connectConfig[key] = val
    }

    connectConfig.password = password

    return this.client.connect(connectConfig)
  }

  disconnectImpl() {
    if (this.client != null) {
      this.client.logout(() => {
        this.client.end()
        return this.client = null
      })
    }

    return this.setConnected(false)
  }

  getClientConfig() {
    const result: any = {}

    result.host = this.config.host
    result.port = this.config.port
    result.user = this.config.user
    result.password = this.config.password

    return result
  }

  getSafeConfig() {
    const result: any = {}

    Object.entries(this.config).forEach(entry => {
      result[entry[0]] = entry[1]
    })

    if (this.config.storePassword) {
      result.password = Utils.encrypt(result.password, this.getDescription())
    } else {
      delete result.password
    }

    delete result.passwordDecrypted

    return result
  }

  getFile(path: string) {
    return new FTPFile(this, false, path)
  }

  getDirectory(path: string) {
    return new FTPDirectory(this, false, path)
  }

  getItemWithPathDescription(pathDescription: PathDescription) {
    if (pathDescription.isFile) {
      return new FTPFile(this, pathDescription.isLink, pathDescription.path, pathDescription.name)
    }

    return new FTPDirectory(this, pathDescription.isLink, pathDescription.path)
  }

  getInitialDirectory() {
    return this.getDirectory(this.config.folder)
  }

  getURI(item: VItem): string {
    return this.config.protocol+'://' + PathUtil.join(this.config.host, item.getPath())
  }

  getPathUtil() {
    return PathUtil
  }

  getPathFromURI(uri: string): string | null {
    const root = this.config.protocol+'://'+this.config.host

    if (uri.substring(0, root.length) === root) {
      return uri.substring(root.length)
    }

    return null
  }

  renameImpl(oldPath: string, newPath: string, callback: any) {
    return this.client.rename(oldPath, newPath, (err: any) => {
      if (!callback) {
        return
      }

      if (err) {
        callback(err.message)
      } else {
        callback(null)
      }
    })
  }

  makeDirectoryImpl(path: string, callback: any) {
    return this.client.mkdir(path, true, (err: any) => {
      if (!callback) {
        return
      }

      if (err) {
        callback(err.message)
      } else {
        callback(null)
      }
    })
  }

  deleteFileImpl(path: string, callback: any) {
    return this.client.delete(path, (err: any) => {
      if (!callback) {
        return
      }

      if (err) {
        callback(err.message)
      } else {
        callback(null)
      }
    })
  }

  deleteDirectoryImpl(path: string, callback: any) {
    return this.client.rmdir(path, (err: any) => {
      if (!callback) {
        return
      }

      if (err) {
        callback(err.message)
      } else {
        callback(null)
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

  downloadImpl(path: string, localPath: string, callback: any) {
    return this.client.get(path, (err: any, stream: any) => {
      if (err) {
        callback(err)
        return
      }

      stream.on('error', callback)
      stream.on('end', callback)
      stream.pipe(fs.createWriteStream(localPath))
    })
  }

  uploadImpl(localPath: string, path: string, callback: any) {
    this.client.put(localPath, path, false, callback)
  }

  newFileImpl(path: string, callback: any) {
    const buffer = new Buffer('', 'utf8')
    this.client.put(buffer, path, (err: any) => {
      if (err) {
        callback(null, err)
      } else {
        callback(this.getFile(path), null)
      }
    })
  }

  openFile(file: VFile) {
    this.server.openFile(file)
  }

  createReadStreamImpl(path: string, callback: any) {
    this.client.get(path, callback)
  }

  getDescription(): string {
    return this.config.protocol+'://'+this.config.host+':'+this.config.port
  }

  getEntriesImpl(directory: VDirectory, callback: EntriesCallback) {
    this.list(directory.getPath(), (err: any, entries: VItem[]) => {
      callback(directory, err, entries)
    })
  }

  list(path: string, callback: any) {
    this.client.list(path, (err: any, entries: any[]) => {
      if (err != null) {
        callback(err, [])
      } else {
        callback(null, this.wrapEntries(path, entries))
      }
    })
  }

  wrapEntries(path: string, entries: any[]): VItem[] {
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

  wrapEntry(path: string, entry: any): VItem | null {
    if ((entry.name === '.') || (entry.name === '..')) {
      return null
    }

    let item = null

    if (entry.type === 'd') {
      item = new FTPDirectory(this, false, PathUtil.join(path, entry.name))
    } else if (entry.type === '-') {
      item = new FTPFile(this, false, PathUtil.join(path, entry.name))
    } else if (entry.type === 'l') {
      if (entry.target.indexOf('/') !== -1) {
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
