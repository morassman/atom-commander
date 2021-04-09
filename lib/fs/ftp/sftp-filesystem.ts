import { Server } from '../../servers/server'
import { RemoteFileSystem } from './remote-filesystem'
import { SFTPConfig } from './sftp-config'

const fs = require('fs')
const fsp = require('fs-plus')
const PathUtil = require('path').posix
const VFileSystem = require('../vfilesystem')
const FTPFile = require('./ftp-file')
const FTPDirectory = require('./ftp-directory')
const FTPSymLink = require('./ftp-symlink')
const SFTPSession = require('./sftp-session')
const Utils = require('../../utils')

export class SFTPFileSystem extends RemoteFileSystem<SFTPConfig> {

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

  clone() {
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

  sessionOpened(session) {
    if (session === this.session) {
      this.client = session.getClient()
      return this.setConnected(true)
    }
  }

  sessionCanceled(session) {
    if (session === this.session) {
      this.session = null
      return this.setConnected(false)
    }
  }

  sessionClosed(session) {
    if (session === this.session) {
      this.session = null
      this.client = null
      return this.setConnected(false)
    }
  }

  getClientConfig() {
    const result = {}

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

  getPrivateKey(path) {
    if (!path || (path.length === 0)) {
      return ''
    }

    path = Utils.resolveHome(path)

    if (!fsp.isFileSync(path)) {
      return ''
    }

    return fs.readFileSync(path, 'utf8')
  }

  getSafeConfig() {
    const result = {}

    for (let key in this.config) {
      const val = this.config[key]
      result[key] = val
    }

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

  getFile(path) {
    return new FTPFile(this, false, path)
  }

  getDirectory(path) {
    return new FTPDirectory(this, false, path)
  }

  getItemWithPathDescription(pathDescription) {
    if (pathDescription.isFile) {
      return new FTPFile(this, pathDescription.isLink, pathDescription.path, pathDescription.name)
    }

    return new FTPDirectory(this, pathDescription.isLink, pathDescription.path)
  }

  getInitialDirectory() {
    return this.getDirectory(this.config.folder)
  }

  getURI(item) {
    return this.config.protocol+'://' + PathUtil.join(this.config.host, item.path)
  }

  getPathUtil() {
    return PathUtil
  }

  getPathFromURI(uri) {
    const root = this.config.protocol+'://'+this.config.host

    if (uri.substring(0, root.length) === root) {
      return uri.substring(root.length)
    }

    return null
  }

  renameImpl(oldPath, newPath, callback) {
    return this.client.rename(oldPath, newPath, err => {
      if ((callback == null)) {
        return
      }

      if (err != null) {
        return callback(err)
      } else {
        return callback(null)
      }
    })
  }

  makeDirectoryImpl(path, callback) {
    return this.client.mkdir(path, [], err => {
      if ((callback == null)) {
        return
      }

      if (err != null) {
        return callback(err)
      } else {
        return callback(null)
      }
    })
  }

  deleteFileImpl(path, callback) {
    return this.client.unlink(path, err => {
      if ((callback == null)) {
        return
      }

      if (err != null) {
        return callback(err)
      } else {
        return callback(null)
      }
    })
  }

  deleteDirectoryImpl(path, callback) {
    return this.client.rmdir(path, err => {
      if ((callback == null)) {
        return
      }

      if (err != null) {
        return callback(err)
      } else {
        return callback(null)
      }
    })
  }

  getDisplayName() {
    if (this.config.name && (this.config.name.trim().length > 0)) {
      return this.config.name
    }

    return this.config.host
  }

  getHost() {
    return this.config.host
  }

  getUsername() {
    return this.config.username
  }


  getLocalDirectoryName() {
    return this.config.protocol+'_'+this.config.host+'_'+this.config.port+'_'+this.config.username
  }

  downloadImpl(path, localPath, callback) {
    return this.client.fastGet(path, localPath, {}, callback)
  }

  uploadImpl(localPath, path, callback) {
    return this.client.fastPut(localPath, path, {}, callback)
  }

  openFile(file) {
    return this.server.getRemoteFileManager().openFile(file)
  }

  createReadStreamImpl(path, callback) {
    const rs = this.client.createReadStream(path)
    return callback(null, rs)
  }

  getDescription() {
    return this.config.protocol+'://'+this.config.host+':'+this.config.port
  }

  getEntriesImpl(directory, callback) {
    return this.list(directory.getPath(), (err, entries) => {
      return callback(directory, err, entries)
    })
  }

  list(path, callback) {
    return this.client.readdir(path, (err, entries) => {
      if (err != null) {
        return callback(err, [])
      } else {
        return callback(null, this.wrapEntries(path, entries))
      }
    })
  }

  wrapEntries(path, entries) {
    const directories = []
    const files = []

    for (let entry of Array.from(entries)) {
      const wrappedEntry = this.wrapEntry(path, entry)

      if (wrappedEntry !== null) {
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

  wrapEntry(path, entry) {
    let item = null

    if (entry.attrs.isDirectory()) {
      item = new FTPDirectory(this, false, PathUtil.join(path, entry.filename))
    } else if (entry.attrs.isFile()) {
      item = new FTPFile(this, false, PathUtil.join(path, entry.filename))
    } else if (entry.attrs.isSymbolicLink()) {
      item = this.wrapSymLinkEntry(path, entry)
    }

    if (item != null) {
      item.modifyDate = new Date(entry.attrs.mtime*1000)
      item.size = entry.attrs.size
    }

    return item
  }

  wrapSymLinkEntry(path, entry) {
    const fullPath = PathUtil.join(path, entry.filename)
    const result = new FTPSymLink(this, fullPath)
    this.client.stat(fullPath, (err, stat) => {
      if (err != null) {
        return
      }

      result.setModifyDate(new Date(entry.attrs.mtime*1000))
      result.setSize(entry.attrs.size)

      return this.client.readlink(fullPath, (err, target) => {
        if (err != null) {
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

  newFileImpl(path, callback) {
    return this.client.open(path, 'w', {}, (err, handle) => {
      if (err != null) {
        callback(null, err)
        return
      }

      return this.client.close(handle, err => {
        if (err != null) {
          callback(null, err)
          return
        }

        return callback(this.getFile(path), null)
      })
    })
  }

}