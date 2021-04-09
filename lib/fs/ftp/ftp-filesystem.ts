const fs = require('fs')
const FTPClient = require('ftp')
const PathUtil = require('path').posix
const VFileSystem = require('../vfilesystem')
const FTPFile = require('./ftp-file')
const FTPDirectory = require('./ftp-directory')
const Utils = require('../../utils')

import { Server } from '../../servers/server'
import { FTPConfig } from './ftp-config'
import { RemoteFileSystem } from './remote-filesystem'

export class FTPFileSystem extends RemoteFileSystem<FTPConfig> {

  constructor(server: Server, config: FTPConfig) {
    super(server, config)
    this.client = null

    if ((this.config.password != null) && (this.config.passwordDecrypted == null)) {
      this.config.password = Utils.decrypt(this.config.password, this.getDescription())
      this.config.passwordDecrypted = true
    }

    this.clientConfig = this.getClientConfig()
  }

  clone() {
    const cloneFS = new FTPFileSystem(this.server, this.config)
    cloneFS.clientConfig = this.clientConfig
    return cloneFS
  }

  connectImpl() {
    if ((this.clientConfig.password != null) && (this.clientConfig.password.length > 0)) {
      return this.connectWithPassword(this.clientConfig.password)
    } else {
      let prompt = 'Enter password for '
      prompt += this.clientConfig.user
      prompt += '@'
      prompt += this.clientConfig.host
      prompt += ':'

      return Utils.promptForPassword(prompt, password => {
        if (password != null) {
          return this.connectWithPassword(password)
        } else {
          const err = {}
          err.canceled = true
          err.message = 'Incorrect credentials for '+this.clientConfig.host
          return this.disconnect(err)
        }
      })
    }
  }

  connectWithPassword(password) {
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

    this.client.on('error', err => {
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

    const connectConfig = {}

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
    const result = {}

    result.host = this.config.host
    result.port = this.config.port
    result.user = this.config.user
    result.password = this.config.password

    return result
  }

  getSafeConfig() {
    const result = {}

    for (let key in this.config) {
      const val = this.config[key]
      result[key] = val
    }

    if (this.config.storePassword) {
      result.password = Utils.encrypt(result.password, this.getDescription())
    } else {
      delete result.password
    }

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
        return callback(err.message)
      } else {
        return callback(null)
      }
    })
  }

  makeDirectoryImpl(path, callback) {
    return this.client.mkdir(path, true, err => {
      if ((callback == null)) {
        return
      }

      if (err != null) {
        return callback(err.message)
      } else {
        return callback(null)
      }
    })
  }

  deleteFileImpl(path, callback) {
    return this.client.delete(path, err => {
      if ((callback == null)) {
        return
      }

      if (err != null) {
        return callback(err.message)
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
        return callback(err.message)
      } else {
        return callback(null)
      }
    })
  }

  getHost() {
    return this.config.host
  }

  getDisplayName() {
    if (this.config.name && (this.config.name.trim().length > 0)) {
      return this.config.name
    }

    return this.config.host
  }

  getUsername() {
    return this.config.user
  }

  getLocalDirectoryName() {
    return this.config.protocol+'_'+this.config.host+'_'+this.config.port+'_'+this.config.user
  }

  downloadImpl(path, localPath, callback) {
    return this.client.get(path, (err, stream) => {
      if (err != null) {
        callback(err)
        return
      }

      stream.on('error', callback)
      stream.on('end', callback)
      return stream.pipe(fs.createWriteStream(localPath))
    })
  }

  uploadImpl(localPath, path, callback) {
    return this.client.put(localPath, path, false, callback)
  }

  newFileImpl(path, callback) {
    const buffer = new Buffer('', 'utf8')
    return this.client.put(buffer, path, err => {
      if (err != null) {
        return callback(null, err)
      } else {
        return callback(this.getFile(path), null)
      }
    })
  }

  openFile(file) {
    return this.server.openFile(file)
  }

  createReadStreamImpl(path, callback) {
    return this.client.get(path, callback)
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
    return this.client.list(path, (err, entries) => {
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

    if (item != null) {
      item.modifyDate = entry.date
      item.size = entry.size
    }

    return item
  }

}
