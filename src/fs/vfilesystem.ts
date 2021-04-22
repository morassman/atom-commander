const q = require('q')
import { CompositeDisposable, Disposable, Emitter } from 'atom'
import { VFile } from './vfile'
import { VDirectory } from './vdirectory'
import { TaskManager } from './task-manager'
import { VItem } from '.'
import { main } from '../main'
import { PathDescription } from './path-description'

export type EmitterCallback = (value?: any) => void
export type ErrorCallback = (err?: any) => void
export type NewFileCallback = (file: VFile | undefined, error?: any) => void
export type ReadStreamCallback = (error?: any, stream?: NodeJS.ReadableStream) => void
export type EntriesCallback = (directory: VDirectory, err: any|undefined, items: VItem[]) => void

export abstract class VFileSystem {

  emitter: Emitter
  taskManager?: TaskManager
  connecting: boolean
  connected: boolean

  constructor() {
    this.emitter = new Emitter()
    this.connecting = false
    this.connected = false
  }

  getTaskManager(): TaskManager {
    if (!this.taskManager) {
      this.taskManager = new TaskManager(this.clone())
    }

    return this.taskManager
  }

  getTaskCount(): number {
    return this.taskManager ? this.taskManager.getTaskCount() : 0
  }

  dispose() {
    this.emitter.dispose()
  }

  connectPromise(): Promise<any> {
    const deferred = q.defer()

    if (this.isConnected()) {
      deferred.resolve()
      return deferred.promise
    }

    let disposables = new CompositeDisposable()

    disposables.add(this.onConnected(() => {
      disposables.dispose()
      deferred.resolve()
    }))

    disposables.add(this.onError(err => {
      disposables.dispose()
      deferred.reject(err)
    }))

    this.connect()

    return deferred.promise
  }

  onConnected(callback: EmitterCallback): Disposable {
    return this.emitter.on('connected', callback)
  }

  onDisconnected(callback: EmitterCallback): Disposable {
    return this.emitter.on('disconnected', callback)
  }

  // Callback receives a single 'err' parameter.
  onError(callback: EmitterCallback): Disposable {
    return this.emitter.on('error', callback)
  }

  emitConnected() {
    this.emitter.emit('connected')
  }

  emitDisconnected() {
    this.emitter.emit('disconnected')
  }

  emitError(err: any) {
    this.emitter.emit('error', err)
  }

  isRemote() {
    return !this.isLocal()
  }

  isConnecting() {
    return this.connecting
  }

  connect() {
    if (!this.isConnected() && !this.isConnecting()) {
      this.connecting = true
      this.connectImpl()
    }
  }

  disconnect(err?: any) {
    this.disconnectImpl()

    if (err) {
      this.emitError(err)
    }
  }

  isConnected() {
    return this.connected
  }

  setConnected(connected: boolean) {
    this.connecting = false

    if (this.connected === connected) {
      return
    }

    this.connected = connected

    if (this.connected) {
      this.emitConnected()
    } else {
      this.emitDisconnected()
    }
  }

  // Returns a clone of this file system. This is used for the TaskManager so
  // that transfers can be done while the file system can still be browsed.
  abstract clone(): VFileSystem

  abstract connectImpl(): void

  abstract disconnectImpl(): void

  // Returns the path part of the URI relative to this file system. undefined if this
  // URI doesn't match this file system.
  // Example : 'sftp://localhost/Test/Path' => '/Test/Path'
  getPathFromURI(uri: string): string | undefined {
    return uri
  }

  getInitialDirectory(): VDirectory | undefined {
    return this.getDirectory('/')
  }

  getDisplayName(): string {
    return this.getName()
  }

  abstract isLocal(): boolean

  abstract getFile(path: string): VFile | undefined

  abstract getDirectory(path: string): VDirectory | undefined

  abstract getItemWithPathDescription(pathDescription: PathDescription): VItem | undefined

  abstract getURI(item: VItem): string

  abstract getName(): string

  // Returns an string that uniquely IDs this file system.
  abstract getID(): string

  abstract getSafeConfig(): any

  abstract getPathUtil(): any

  abstract getUsername(): string

  // Callback receives a single string argument with error message. undefined if no error.
  rename(oldPath: string, newPath: string, callback: ErrorCallback) {
    const successCallback = () => {
      this.renameImpl(oldPath, newPath, callback)
    }

    this.connectPromise().then(successCallback, callback)
  }

  abstract renameImpl(oldPath: string, newPath: string, callback: ErrorCallback): void

  // Callback receives a single string argument with error message. undefined if no error.
  makeDirectory(path: string, callback: ErrorCallback) {
    const successCallback = () => {
      this.makeDirectoryImpl(path, callback)
    }

    this.connectPromise().then(successCallback, callback)
  }

  abstract makeDirectoryImpl(path: string, callback: ErrorCallback): void

  // Callback receives a single string argument with error message. undefined if no error.
  deleteFile(path: string, callback: ErrorCallback) {
    const successCallback = () => {
      this.deleteFileImpl(path, callback)
    }

    this.connectPromise().then(successCallback, callback)
  }

  abstract deleteFileImpl(path: string, callback: ErrorCallback): void

  // Callback receives a single string argument with error message. undefined if no error.
  deleteDirectory(path: string, callback: ErrorCallback) {
    const successCallback = () => {
      this.deleteDirectoryImpl(path, callback)
    }

    this.connectPromise().then(successCallback, callback)
  }

  abstract deleteDirectoryImpl(path: string, callback: ErrorCallback): void

  // Callback receives a single string argument with error message. undefined if no error.
  download(path: string, localPath: string, callback: ErrorCallback) {
    const successCallback = () => {
      this.downloadImpl(path, localPath, callback)
    }

    this.connectPromise().then(successCallback, callback)
  }

  abstract downloadImpl(path: string, localPath: string, callback: ErrorCallback): void

  abstract openFile(file: VFile): void

  fileOpened(file: VFile) {
    const hideOnOpen = atom.config.get('atom-commander.panel.hideOnOpen')

    if (hideOnOpen) {
      main.hide()
    }
  }

  // Callback receives two arguments:
  // 1.) err : String with error message. undefined if no error.
  // 2.) stream : A ReadableStream.
  createReadStream(path: string, callback: ReadStreamCallback) {
    const successCallback = () => {
      this.createReadStreamImpl(path, callback)
    }

    const errorCallback = (err: string) => {
      callback(err)
    }

    this.connectPromise().then(successCallback, errorCallback)
  }

  abstract createReadStreamImpl(path: string, callback: ReadStreamCallback): void

  // The callback receives two parameters :
  // 1.) file : The file that was created. undefined if it could not be created.
  // 2.) err : The error if the file could not be created.
  newFile(path: string, callback: NewFileCallback) {
    const successCallback = () => {
      this.newFileImpl(path, callback)
    }

    const errorCallback = (err: string) => {
      callback(undefined, err)
    }

    this.connectPromise().then(successCallback, errorCallback)
  }

  abstract newFileImpl(path: string, callback: NewFileCallback): void

  // The callback received three parameters :
  // 1.) The directory.
  // 2.) err if there is an error. undefined if not.
  // 3.) The list of entries containing VFile and VDirectory instances.
  getEntries(directory: VDirectory, callback: EntriesCallback) {
    const successCallback = () => {
      this.getEntriesImpl(directory, callback)
    }

    const errorCallback = (err: string) => {
      callback(directory, err, [])
    }

    this.connectPromise().then(successCallback, errorCallback)
  }

  abstract getEntriesImpl(directory: VDirectory, callback: EntriesCallback): void

  upload(localPath: string, path: string, callback: ErrorCallback) {
    const successCallback = () => {
      this.uploadImpl(localPath, path, callback)
    }

    this.connectPromise().then(successCallback, callback)
  }

  abstract uploadImpl(localPath: string, path: string, callback: ErrorCallback): void

}
