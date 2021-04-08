import { CompositeDisposable, Emitter } from 'atom'

import Queue from 'queue'
import { VDirectory, VFile, VItem, EmitterCallback, VFileSystem, ErrorCallback } from '.'
const PathUtil = require('path')
const fse = require('fs-extra')
const fs = require('fs')
const Utils = require('../utils')

export type UploadCallback = (err: any | null, item: VItem) => void
export type DownloadCallback = (err: any | null, item: VItem) => void

export class TaskManager {

  fileSystem: VFileSystem
  emitter: Emitter
  uploadCount: number
  downloadCount: number
  taskQueue: Queue
  disposables: CompositeDisposable

  constructor(fileSystem: VFileSystem) {
    this.fileSystem = fileSystem
    this.emitter = new Emitter()
    this.uploadCount = 0
    this.downloadCount = 0
    this.taskQueue = new Queue()
    this.taskQueue.concurrency = 1
    this.disposables = new CompositeDisposable()

    this.taskQueue.on('success', (result, job) => {
      return this.jobEnded(job, false, null)
    })

    this.taskQueue.on('error', (err, job) => {
      if (err.canceled) {
        this.jobEnded(job, true, err)
        return this.taskQueue.end(err)
      } else {
        return this.jobEnded(job, false, err)
      }
    })

    this.taskQueue.on('end', err => {
      this.setUploadCount(0)
      this.setDownloadCount(0)

      if (this.emitter !== null) {
        return this.emitter.emit('end', err)
      }
    })

    this.disposables.add(this.fileSystem.onError(err => {
      if (this.taskQueue.length === 0) {
        return
      }

      if (err != null) {
        Utils.showErrorWarning('Transfer failed', null, null, err, true)
      }

      return this.taskQueue.end(err)
    })
    )
  }

  onUploadCount(callback: EmitterCallback) {
    if (this.emitter) {
      this.emitter.on('uploadcount', callback)
    }
  }

  onDownloadCount(callback: EmitterCallback) {
    if (this.emitter) {
      this.emitter.on('downloadcount', callback)
    }
  }

  onEnd(callback: EmitterCallback) {
    if (this.emitter) {
      this.emitter.on('end', callback)
    }
  }

  jobEnded(job, canceled, err) {
    if (job.upload) {
      this.adjustUploadCount(-1)
    } else if (job.download) {
      this.adjustDownloadCount(-1)
    }

    return (typeof job.callback === 'function' ? job.callback(canceled, err, job.item) : undefined)
  }

  adjustUploadCount(diff: number) {
    return this.setUploadCount(this.uploadCount + diff)
  }

  adjustDownloadCount(diff: number) {
    return this.setDownloadCount(this.downloadCount + diff)
  }

  setUploadCount(uploadCount: number) {
    const old = this.uploadCount
    this.uploadCount = uploadCount

    if (this.emitter !== null) {
      return this.emitter.emit('uploadcount', [old, this.uploadCount])
    }
  }

  setDownloadCount(downloadCount: number) {
    const old = this.downloadCount
    this.downloadCount = downloadCount

    if (this.emitter !== null) {
      return this.emitter.emit('downloadcount', [old, this.downloadCount])
    }
  }

  clearTasks() {
    return this.taskQueue.end()
  }

  dispose() {
    this.taskQueue.end()
    return this.fileSystem.disconnect()
  }

  getFileSystem() {
    return this.fileSystem
  }

  getTaskCount() {
    return this.taskQueue.length
  }

  // callback receives two parameters:
  // 1.) err - null if there was no error.
  // 2.) item - The item that was uploaded.
  uploadItem(remoteParentPath: string, item: VItem, callback: UploadCallback) {
    return this.uploadItems(remoteParentPath, [item], callback)
  }

  uploadItems(remoteParentPath: string, items: VItem[], callback: UploadCallback) {
    this.uploadItemsWithQueue(remoteParentPath, items, callback)
    return this.taskQueue.start()
  }

  uploadItemsWithQueue(remoteParentPath: string, items: VItem[], callback: UploadCallback) {
    for (let item of Array.from(items)) {
      if (!item.isLink()) {
        if (item.isFile()) {
          this.uploadFileWithQueue(remoteParentPath, item as VFile, callback)
        } else {
          this.uploadDirectoryWithQueue(remoteParentPath, item as VDirectory, callback)
        }
      }
    }
  }

  uploadFileWithQueue(remoteParentPath: string, file: VFile, callback: UploadCallback) {
    const remoteFilePath = PathUtil.posix.join(remoteParentPath, file.getBaseName())

    const task = cb => {
      return this.fileSystem.upload(file.getPath(), remoteFilePath, cb)
    }

    return this.addUploadTask(task, file, callback)
  }

  uploadDirectoryWithQueue(remoteParentPath: string, directory: VDirectory, callback: UploadCallback) {
    const remoteFolderPath = PathUtil.posix.join(remoteParentPath, directory.getBaseName())

    const task1 = (cb: ErrorCallback) => {
      this.fileSystem.makeDirectory(remoteFolderPath, cb)
    }

    this.addUploadTask(task1, directory, callback)

    const task2 = cb => {
      return directory.getEntries((dir, err, entries) => {
        if (err != null) {
          return cb(err)
        } else {
          this.uploadItemsWithQueue(remoteFolderPath, entries)
          return cb()
        }
      })
    }

    return this.addUploadTask(task2, directory, callback)
  }

  // callback receives two parameters:
  // 1.) err - null if there was no error.
  // 2.) item - The item that was downloaded.
  downloadItem(localParentPath: string, item: VItem, callback: DownloadCallback) {
    return this.downloadItems(localParentPath, [item], callback)
  }

  downloadItems(localParentPath: string, items: VItem[], callback: DownloadCallback) {
    this.downloadItemsWithQueue(localParentPath, items, callback)
    return this.taskQueue.start()
  }

  downloadItemsWithQueue(localParentPath: string, items: VItem[], callback: DownloadCallback) {
    return (() => {
      const result = []
      for (let item of Array.from(items)) {
        if (!item.isLink()) {
          if (item.isFile()) {
            result.push(this.downloadFileWithQueue(localParentPath, item, callback))
          } else {
            result.push(this.downloadDirectoryWithQueue(localParentPath, item, callback))
          }
        } else {
          result.push(undefined)
        }
      }
      return result
    })()
  }

  downloadFileWithQueue(localParentPath: string, file: VFile, callback: DownloadCallback) {
    const localFilePath = PathUtil.join(localParentPath, file.getBaseName())

    const task = (cb: ErrorCallback) => {
      return file.download(localFilePath, cb)
    }

    return this.addDownloadTask(task, file, callback)
  }

  downloadDirectoryWithQueue(localParentPath: string, directory: VDirectory, callback: DownloadCallback) {
    const localFolderPath = PathUtil.join(localParentPath, directory.getBaseName())

    const task1 = (cb: ErrorCallback) => {
      fse.ensureDirSync(localFolderPath)
      cb(null)
    }

    this.addDownloadTask(task1, directory, callback)

    const task2 = (cb: ErrorCallback) => {
      return directory.getEntries((dir, err, entries) => {
        if (err != null) {
          return cb(err)
        } else {
          this.downloadItemsWithQueue(localFolderPath, entries, callback)
          return cb(null)
        }
      })
    }

    return this.addDownloadTask(task2, directory, callback)
  }

  addUploadTask(task, item, callback) {
    task.upload = true
    task.item = item
    task.callback = callback
    this.adjustUploadCount(1)
    return this.taskQueue.push(task)
  }

  addDownloadTask(task, item, callback) {
    task.download = true
    task.item = item
    task.callback = callback
    this.adjustDownloadCount(1)
    return this.taskQueue.push(task)
  }

}
