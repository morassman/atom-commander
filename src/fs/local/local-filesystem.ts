import * as fsp from 'fs-plus'
const fse = require('fs-extra')
const PathUtil = require('path')

import { Directory, File } from 'atom'
import { EntriesCallback, ErrorCallback, NewFileCallback, ReadStreamCallback, VFileSystem, VItem } from '../'
import { PathDescription } from '../path-description'
import { LocalDirectory, LocalFile } from './'

export class LocalFileSystem extends VFileSystem {

  constructor() {
    super()
  }

  clone(): LocalFileSystem {
    return new LocalFileSystem()
  }

  isLocal(): boolean {
    return true;
  }

  connectImpl() {
    this.setConnected(true);
  }

  disconnectImpl() {
  }

  getSafeConfig(): any {
    return {}
  }

  getFile(path: string): LocalFile {
    return new LocalFile(this, new File(path));
  }

  getDirectory(path: string): LocalDirectory {
    return new LocalDirectory(this, new Directory(path));
  }

  getItemWithPathDescription(pathDescription: PathDescription) {
    if (pathDescription.isFile) {
      return this.getFile(pathDescription.path);
    }

    return this.getDirectory(pathDescription.path);
  }

  getURI(item: VItem) {
    return item.getRealPathSync();
  }

  getName(): string {
    return 'local'
  }

  getID(): string {
    return 'local'
  }

  getUsername(): string {
    return ''
  }

  getPathUtil() {
    return PathUtil;
  }

  renameImpl(oldPath: string, newPath: string, callback: ErrorCallback) {
    fsp.moveSync(oldPath, newPath);
    if (callback !== null) {
      return callback(null);
    }
  }

  makeDirectoryImpl(path: string, callback: ErrorCallback) {
    const directory = new Directory(path);

    return directory.create().then(created => {
      if ((callback == null)) {
        return;
      }

      if (created) {
        return callback(null);
      } else {
        return callback("Error creating folder.");
      }
    });
  }

  deleteFileImpl(path: string, callback: ErrorCallback) {
    fse.removeSync(path);

    if (callback != null) {
      return callback(null);
    }
  }

  deleteDirectoryImpl(path: string, callback: ErrorCallback) {
    fse.removeSync(path);

    if (callback != null) {
      callback(null);
    }
  }

  downloadImpl(path: string, localPath: string, callback: ErrorCallback) {
    fse.copy(path, localPath, callback);
  }

  // TODO : callback type
  uploadImpl(localPath: string, path: string, callback: any) {
    fse.copy(localPath, path, callback);
  }

  openFile(file: LocalFile) {
    atom.workspace.open(file.getRealPathSync());
    this.fileOpened(file);
  }

  createReadStreamImpl(path: string, callback: ReadStreamCallback) {
    callback(null, fse.createReadStream(path));
  }

  newFileImpl(path: string, callback: NewFileCallback) {
    const file = new File(path);

    const p = file.create().then(created => {
      if (created) {
        callback(this.getFile(path), null);
      } else {
        callback(null, 'File could not be created.');
      }
    }).catch((error: any) => {
      callback(null, error);
    });
  }

  getEntriesImpl(directory: LocalDirectory, callback: EntriesCallback) {
    return directory.directory.getEntries((err, entries) => {
      if (err != null) {
        return callback(directory, err, []);
      } else {
        return callback(directory, null, this.wrapEntries(entries));
      }
    });
  }

  wrapEntries(entries: (Directory | File)[]) {
    const result = [];

    for (let entry of Array.from(entries)) {
      // Added a try/catch, because it was found that there are sometimes
      // temporary files created by the OS in the list of entries that no longer
      // exist by the time they get here. Reading them then threw an error.
      try {
        if (entry.isDirectory()) {
          result.push(new LocalDirectory(this, entry));
        } else {
          result.push(new LocalFile(this, entry));
        }
      } catch (error) {
        console.error(error);
      }
    }

    return result;
  }

}
