/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let LocalFileSystem;
const fsp = require('fs-plus');
const fse = require('fs-extra');
const VFileSystem = require('../vfilesystem');
const LocalFile = require('./local-file');
const LocalDirectory = require('./local-directory');
const {Directory, File} = require('atom');
const PathUtil = require('path');

module.exports =
(LocalFileSystem = class LocalFileSystem extends VFileSystem {

  constructor(main) {
    super(main);
  }

  clone() {
    return new LocalFileSystem(this.getMain());
  }

  isLocal() {
    return true;
  }

  connectImpl() {
    return this.setConnected(true);
  }

  getSafeConfig() {
    return {};
  }

  getFile(path) {
    return new LocalFile(this, new File(path));
  }

  getDirectory(path) {
    return new LocalDirectory(this, new Directory(path));
  }

  getItemWithPathDescription(pathDescription) {
    if (pathDescription.isFile) {
      return this.getFile(pathDescription.path);
    }

    return this.getDirectory(pathDescription.path);
  }

  getURI(item) {
    return item.getRealPathSync();
  }

  getName() {
    return "local";
  }

  getID() {
    return "local";
  }

  getUsername() {
    return "";
  }

  getPathUtil() {
    return PathUtil;
  }

  renameImpl(oldPath, newPath, callback) {
    fsp.moveSync(oldPath, newPath);
    if (callback !== null) {
      return callback(null);
    }
  }

  makeDirectoryImpl(path, callback) {
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

  deleteFileImpl(path, callback) {
    fse.removeSync(path);

    if (callback != null) {
      return callback(null);
    }
  }

  deleteDirectoryImpl(path, callback) {
    fse.removeSync(path);

    if (callback != null) {
      return callback(null);
    }
  }

  downloadImpl(path, localPath, callback) {
    return fse.copy(path, localPath, callback);
  }

  upload(localPath, path, callback) {
    return fse.copy(localPath, path, callback);
  }

  openFile(file) {
    atom.workspace.open(file.getRealPathSync());
    return this.fileOpened(file);
  }

  createReadStreamImpl(path, callback) {
    return callback(null, fse.createReadStream(path));
  }

  newFileImpl(path, callback) {
    const file = new File(path);

    const p = file.create().then(created => {
      if (created) {
        return callback(this.getFile(path), null);
      } else {
        return callback(null, 'File could not be created.');
      }
    });
    return p.catch(error => {
      return callback(null, error);
    });
  }

  getEntriesImpl(directory, callback) {
    return directory.directory.getEntries((err, entries) => {
      if (err != null) {
        return callback(directory, err, []);
      } else {
        return callback(directory, null, this.wrapEntries(entries));
      }
    });
  }

  wrapEntries(entries) {
    const result = [];

    for (let entry of Array.from(entries)) {
      // Added a try/catch, because it was found that there are sometimes
      // temporary files created by the OS in the list of entries that no
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
});
