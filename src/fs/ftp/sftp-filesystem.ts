import { Server } from '../../servers/server'
import { RemoteFileSystem } from './remote-filesystem'
import { SFTPConfig } from './sftp-config'
import * as fsp from 'fs-plus'
import Utils from '../../utils'
import { EntriesCallback, ErrorCallback, NewFileCallback, ReadStreamCallback, VFile, VItem } from '..'
import { SFTPSession } from './sftp-session'
import { FTPFile } from './ftp-file'
import { FTPDirectory } from './ftp-directory'
import { PathDescription } from '../path-description'
import { VDirectory } from '../vdirectory'
import { FTPSymLink } from './ftp-symlink'
import { SFTPFile } from './sftp-file'
import { SFTPDirectory } from './sftp-directory'
import { SFTPSymLink } from './sftp-symlink'

const fs = require('fs')
const PathUtil = require('path').posix

export class SFTPFileSystem extends RemoteFileSystem<SFTPConfig> {

  // TODO Type
  session: any

  // TODO Type
  client: any

  // TODO Type
  clientConfig: any

  constructor(server: Server, config: SFTPConfig) {
    super(server, config)
    this.session = null
    this.client = null

    if (!this.config.passwordDecrypted) {
      if ((this.config.password != null) && (this.config.password.length > 0)) {
        this.config.password = Utils.decrypt(this.config.password, this.getDescription())
      }
      if ((this.config.passphrase != null) && (this.config.passphrase.length > 0)) {
        this.config.passphrase = Utils.decrypt(this.config.passphrase, this.getDescription())
      }
      this.config.passwordDecrypted = true
    }

    this.clientConfig = this.getClientConfig()
  }

  clone(): SFTPFileSystem {
    const cloneFS = new SFTPFileSystem(this.server, this.config)
    cloneFS.clientConfig = this.clientConfig
    return cloneFS
  }

  connectImpl() {
    this.session = new SFTPSession(this)
    return this.session.connect()
  }

  disconnectImpl() {
    if (this.session != null) {
      return this.session.disconnect()
    }
  }

  sessionOpened(session: SFTPSession) {
    if (session === this.session) {
      this.client = session.getClient()
      this.setConnected(true)
    }
  }

  sessionCanceled(session: SFTPSession) {
    if (session === this.session) {
      this.session = null
      this.setConnected(false)
    }
  }

  sessionClosed(session: SFTPSession) {
    if (session === this.session) {
      this.session = null
      this.client = null
      this.setConnected(false)
    }
  }

  getClientConfig() {
    const result: any = {}

    result.host = this.config.host
    result.port = this.config.port
    result.username = this.config.username
    result.password = this.config.password
    result.passphrase = this.config.passphrase
    result.tryKeyboard = true
    result.keepaliveInterval = 60000

    if (!this.config.loginWithPassword) {
      try {
        result.privateKey = this.getPrivateKey(this.config.privateKeyPath)
      } catch (err) {
        Utils.showErrorWarning('Error reading private key', null, null, err, true)
      }
    }

    return result
  }

  getPrivateKey(path: string): string {
    if (!path || (path.length === 0)) {
      return ''
    }

    path = Utils.resolveHome(path)

    if (!fsp.isFileSync(path)) {
      return ''
    }

    return fs.readFileSync(path, 'utf8')
  }

  getSafeConfig(): any {
    const result: any = {}

    Object.entries(this.config).forEach(entry => {
      result[entry[0]] = entry[1]
    })

    if (this.config.storePassword) {
      if ((this.config.password != null) && (this.config.password.length > 0)) {
        result.password = Utils.encrypt(result.password, this.getDescription())
      }
      if ((this.config.passphrase != null) && (this.config.passphrase.length > 0)) {
        result.passphrase = Utils.encrypt(result.passphrase, this.getDescription())
      }
    } else {
      delete result.password
      delete result.passphrase
    }

    delete result.privateKey
    delete result.passwordDecrypted

    return result
  }

  getFile(path: string): SFTPFile {
    return new SFTPFile(this, false, path)
  }

  getDirectory(path: string): SFTPDirectory {
    return new SFTPDirectory(this, false, path)
  }

  getItemWithPathDescription(pathDescription: PathDescription): VItem | undefined {
    if (pathDescription.isFile) {
      return new SFTPFile(this, pathDescription.isLink, pathDescription.path, pathDescription.name)
    }

    return new SFTPDirectory(this, pathDescription.isLink, pathDescription.path)
  }

  getInitialDirectory(): SFTPDirectory | undefined {
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

  renameImpl(oldPath: string, newPath: string, callback: ErrorCallback) {
    return this.client.rename(oldPath, newPath, (err: any) => {
      if (!callback) {
        return
      }

      if (err) {
        callback(err)
      } else {
        callback(null)
      }
    })
  }

  makeDirectoryImpl(path: string, callback: ErrorCallback) {
    return this.client.mkdir(path, [], (err: any) => {
      if (!callback) {
        return
      }

      if (err) {
        callback(err)
      } else {
        callback(null)
      }
    })
  }

  deleteFileImpl(path: string, callback: ErrorCallback) {
    this.client.unlink(path, (err: any) => {
      if (!callback) {
        return
      }

      if (err) {
        callback(err)
      } else {
        callback(null)
      }
    })
  }

  deleteDirectoryImpl(path: string, callback: ErrorCallback) {
    return this.client.rmdir(path, (err: any) => {
      if (!callback) {
        return
      }

      if (err) {
        callback(err)
      } else {
        callback(null)
      }
    })
  }

  getDisplayName(): string {
    if (this.config.name && (this.config.name.trim().length > 0)) {
      return this.config.name
    }

    return this.config.host
  }

  getHost(): string {
    return this.config.host
  }

  getUsername(): string {
    return this.config.username
  }


  getLocalDirectoryName(): string {
    return this.config.protocol+'_'+this.config.host+'_'+this.config.port+'_'+this.config.username
  }

  downloadImpl(path: string, localPath: string, callback: ErrorCallback) {
    return this.client.fastGet(path, localPath, {}, callback)
  }

  uploadImpl(localPath: string, path: string, callback: ErrorCallback) {
    return this.client.fastPut(localPath, path, {}, callback)
  }

  openFile(file: VFile) {
    return this.server.getRemoteFileManager().openFile(file)
  }

  createReadStreamImpl(path: string, callback: ReadStreamCallback) {
    const rs = this.client.createReadStream(path)
    callback(null, rs)
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
    return this.client.readdir(path, (err: any, entries: any[]) => {
      if (err) {
        callback(err, [])
      } else {
        callback(null, this.wrapEntries(path, entries))
      }
    })
  }

  wrapEntries(path: string, entries: any[]): VItem[] {
    const directories: VItem[] = []
    const files: VItem[] = []

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
    let item = null

    if (entry.attrs.isDirectory()) {
      item = new SFTPDirectory(this, false, PathUtil.join(path, entry.filename))
    } else if (entry.attrs.isFile()) {
      item = new SFTPFile(this, false, PathUtil.join(path, entry.filename))
    } else if (entry.attrs.isSymbolicLink()) {
      item = this.wrapSymLinkEntry(path, entry)
    }

    if (item) {
      item.modifyDate = new Date(entry.attrs.mtime*1000)
      item.size = entry.attrs.size
    }

    return item
  }

  wrapSymLinkEntry(path: string, entry: any): SFTPSymLink {
    const fullPath = PathUtil.join(path, entry.filename)
    const result = new SFTPSymLink(this, fullPath)
    this.client.stat(fullPath, (err: any, stat: any) => {
      if (err) {
        return
      }

      result.setModifyDate(new Date(entry.attrs.mtime*1000))
      result.setSize(entry.attrs.size)

      return this.client.readlink(fullPath, (err: any, target: string) => {
        if (err) {
          return
        }

        if (stat.isFile()) {
          return result.setTargetFilePath(target)
        } else if (stat.isDirectory()) {
          return result.setTargetDirectoryPath(PathUtil.join(path, target))
        }
      })
    })

    return result
  }

  newFileImpl(path: string, callback: NewFileCallback) {
    return this.client.open(path, 'w', {}, (err: any, handle: any) => {
      if (err != null) {
        callback(null, err)
        return
      }

      return this.client.close(handle, (err: any) => {
        if (err != null) {
          callback(null, err)
          return
        }

        callback(this.getFile(path), null)
      })
    })
  }

}