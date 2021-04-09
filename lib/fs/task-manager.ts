const PathUtil = require('path')
const fse = require('fs-extra')

import { CompositeDisposable, Disposable, Emitter } from 'atom'
import Queue from 'queue'
import { QueueWorker } from 'queue'
import { VDirectory, VFile, VItem, EmitterCallback, VFileSystem, ErrorCallback } from '.'
import Utils from '../utils'

export type TaskCallback = (err: any | null, item: VItem) => void

export interface Task extends QueueWorker {
  upload: boolean
  download: boolean
  item: any
  callback?: TaskCallback
}

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
      this.emitter.emit('end', err)
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

  onUploadCount(callback: EmitterCallback): Disposable {
    return this.emitter.on('uploadcount', callback)
  }

  onDownloadCount(callback: EmitterCallback): Disposable {
    return this.emitter.on('downloadcount', callback)
  }

  onEnd(callback: EmitterCallback): Disposable {
    return this.emitter.on('end', callback)
  }

  jobEnded(job: Task, canceled: boolean, err: any) {
    if (job.upload) {
      this.adjustUploadCount(-1)
    } else if (job.download) {
      this.adjustDownloadCount(-1)
    }

    if (job.callback) {
      job.callback(err, job.item)
    }
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
      this.emitter.emit('downloadcount', [old, this.downloadCount])
    }
  }

  clearTasks() {
    this.taskQueue.end()
  }

  dispose() {
    this.taskQueue.end()
    this.fileSystem.disconnect()
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
  uploadItem(remoteParentPath: string, item: VItem, callback?: TaskCallback) {
    this.uploadItems(remoteParentPath, [item], callback)
  }

  uploadItems(remoteParentPath: string, items: VItem[], callback?: TaskCallback) {
    this.uploadItemsWithQueue(remoteParentPath, items, callback)
    this.taskQueue.start()
  }

  uploadItemsWithQueue(remoteParentPath: string, items: VItem[], callback?: TaskCallback) {
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

  uploadFileWithQueue(remoteParentPath: string, file: VFile, callback?: TaskCallback) {
    const remoteFilePath = PathUtil.posix.join(remoteParentPath, file.getBaseName())

    const task = (cb: any) => {
      this.fileSystem.upload(file.getPath(), remoteFilePath, cb)
    }

    this.addUploadTask(task, file, callback)
  }

  uploadDirectoryWithQueue(remoteParentPath: string, directory: VDirectory, callback?: TaskCallback) {
    const remoteFolderPath = PathUtil.posix.join(remoteParentPath, directory.getBaseName())

    const task1 = (cb: ErrorCallback) => {
      this.fileSystem.makeDirectory(remoteFolderPath, cb)
    }

    this.addUploadTask(task1, directory, callback)

    const task2 = (cb: any) => {
      directory.getEntries((dir, err, entries) => {
        if (err != null) {
          cb(err)
        } else {
          this.uploadItemsWithQueue(remoteFolderPath, entries)
          cb()
        }
      })
    }

    this.addUploadTask(task2, directory, callback)
  }

  // callback receives two parameters:
  // 1.) err - null if there was no error.
  // 2.) item - The item that was downloaded.
  downloadItem(localParentPath: string, item: VItem, callback: TaskCallback) {
    this.downloadItems(localParentPath, [item], callback)
  }

  downloadItems(localParentPath: string, items: VItem[], callback: TaskCallback) {
    this.downloadItemsWithQueue(localParentPath, items, callback)
    this.taskQueue.start()
  }

  downloadItemsWithQueue(localParentPath: string, items: VItem[], callback: TaskCallback) {
    for (let item of items) {
      if (!item.isLink()) {
        if (item.isFile()) {
          this.downloadFileWithQueue(localParentPath, item as VFile, callback)
        } else {
          this.downloadDirectoryWithQueue(localParentPath, item as VDirectory, callback)
        }
      }
    }
  }

  downloadFileWithQueue(localParentPath: string, file: VFile, callback: TaskCallback) {
    const localFilePath = PathUtil.join(localParentPath, file.getBaseName())

    const task = (cb: ErrorCallback) => {
      file.download(localFilePath, cb)
    }

    this.addDownloadTask(task, file, callback)
  }

  downloadDirectoryWithQueue(localParentPath: string, directory: VDirectory, callback: TaskCallback) {
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

  addUploadTask(task: QueueWorker, item: VItem, callback?: TaskCallback) {
    const t = task as Task
    t.upload = true
    t.item = item
    t.callback = callback
    this.adjustUploadCount(1)
    this.taskQueue.push(task)
  }

  addDownloadTask(task: QueueWorker, item: VItem, callback?: TaskCallback) {
    const t = task as Task
    t.download = true
    t.item = item
    t.callback = callback
    this.adjustDownloadCount(1)
    this.taskQueue.push(task)
  }

}
