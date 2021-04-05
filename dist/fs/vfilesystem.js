/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var VFileSystem;
var q = require('q');
var _a = require('atom'), CompositeDisposable = _a.CompositeDisposable, Emitter = _a.Emitter;
var TaskManager = require('./task-manager');
module.exports =
    (VFileSystem = /** @class */ (function () {
        function VFileSystem(main) {
            this.main = main;
            this.emitter = new Emitter();
            this.taskManager = null;
            this.connecting = false;
            this.connected = false;
        }
        VFileSystem.prototype.getMain = function () {
            return this.main;
        };
        VFileSystem.prototype.getTaskManager = function (create) {
            if (create == null) {
                create = true;
            }
            if ((this.taskManager === null) && create) {
                this.taskManager = new TaskManager(this.clone());
            }
            return this.taskManager;
        };
        VFileSystem.prototype.getTaskCount = function () {
            if (this.taskManager === null) {
                return 0;
            }
            return this.taskManager.getTaskCount();
        };
        VFileSystem.prototype.dispose = function () {
            this.emitter.dispose();
            return this.emitter = null;
        };
        VFileSystem.prototype.connectPromise = function () {
            var deferred = q.defer();
            if (this.isConnected()) {
                deferred.resolve();
                return deferred.promise;
            }
            var disposables = new CompositeDisposable();
            disposables.add(this.onConnected(function () {
                disposables.dispose();
                disposables = null;
                return deferred.resolve();
            }));
            disposables.add(this.onError(function (err) {
                disposables.dispose();
                disposables = null;
                return deferred.reject(err);
            }));
            this.connect();
            return deferred.promise;
        };
        VFileSystem.prototype.onConnected = function (callback) {
            if (this.emitter !== null) {
                return this.emitter.on("connected", callback);
            }
        };
        VFileSystem.prototype.onDisconnected = function (callback) {
            if (this.emitter !== null) {
                return this.emitter.on("disconnected", callback);
            }
        };
        // Callback receives a single 'err' parameter.
        VFileSystem.prototype.onError = function (callback) {
            if (this.emitter !== null) {
                return this.emitter.on("error", callback);
            }
        };
        VFileSystem.prototype.emitConnected = function () {
            if (this.emitter !== null) {
                return this.emitter.emit("connected");
            }
        };
        VFileSystem.prototype.emitDisconnected = function () {
            if (this.emitter !== null) {
                return this.emitter.emit("disconnected");
            }
        };
        VFileSystem.prototype.emitError = function (err) {
            if (this.emitter !== null) {
                return this.emitter.emit("error", err);
            }
        };
        VFileSystem.prototype.isRemote = function () {
            return !this.isLocal();
        };
        VFileSystem.prototype.isConnecting = function () {
            return this.connecting;
        };
        VFileSystem.prototype.connect = function () {
            if (!this.isConnected() && !this.isConnecting()) {
                this.connecting = true;
                return this.connectImpl();
            }
        };
        VFileSystem.prototype.disconnect = function (err) {
            this.disconnectImpl();
            if (err != null) {
                return this.emitError(err);
            }
        };
        VFileSystem.prototype.isConnected = function () {
            return this.connected;
        };
        VFileSystem.prototype.setConnected = function (connected) {
            this.connecting = false;
            if (this.connected === connected) {
                return;
            }
            this.connected = connected;
            if (this.connected) {
                return this.emitConnected();
            }
            else {
                return this.emitDisconnected();
            }
        };
        // Returns a clone of this file system. This is used for the TaskManager so
        // that transfers can be done while the file system can still be browsed.
        VFileSystem.prototype.clone = function () { };
        VFileSystem.prototype.connectImpl = function () { };
        VFileSystem.prototype.disconnectImpl = function () { };
        // Returns the path part of the URI relative to this file system. null if this
        // URI doesn't match this file system.
        // Example : "sftp://localhost/Test/Path" => "/Test/Path"
        VFileSystem.prototype.getPathFromURI = function (uri) {
            return uri;
        };
        VFileSystem.prototype.getInitialDirectory = function () {
            return this.getDirectory("/");
        };
        VFileSystem.prototype.getDisplayName = function () {
            return this.getName();
        };
        VFileSystem.prototype.isLocal = function () { };
        VFileSystem.prototype.getFile = function (path) { };
        VFileSystem.prototype.getDirectory = function (path) { };
        VFileSystem.prototype.getItemWithPathDescription = function (pathDescription) { };
        VFileSystem.prototype.getURI = function (item) { };
        VFileSystem.prototype.getName = function () { };
        // Returns an string that uniquely IDs this file system.
        VFileSystem.prototype.getID = function () { };
        VFileSystem.prototype.getSafeConfig = function () { };
        VFileSystem.prototype.getPathUtil = function () { };
        VFileSystem.prototype.getUsername = function () { };
        // Callback receives a single string argument with error message. null if no error.
        VFileSystem.prototype.rename = function (oldPath, newPath, callback) {
            var _this = this;
            var successCallback = function () {
                return _this.renameImpl(oldPath, newPath, callback);
            };
            return this.connectPromise().then(successCallback, callback);
        };
        VFileSystem.prototype.renameImpl = function (oldPath, newPath, callback) { };
        // Callback receives a single string argument with error message. null if no error.
        VFileSystem.prototype.makeDirectory = function (path, callback) {
            var _this = this;
            var successCallback = function () {
                return _this.makeDirectoryImpl(path, callback);
            };
            return this.connectPromise().then(successCallback, callback);
        };
        VFileSystem.prototype.makeDirectoryImpl = function (path, callback) { };
        // Callback receives a single string argument with error message. null if no error.
        VFileSystem.prototype.deleteFile = function (path, callback) {
            var _this = this;
            var successCallback = function () {
                return _this.deleteFileImpl(path, callback);
            };
            return this.connectPromise().then(successCallback, callback);
        };
        VFileSystem.prototype.deleteFileImpl = function (path, callback) { };
        // Callback receives a single string argument with error message. null if no error.
        VFileSystem.prototype.deleteDirectory = function (path, callback) {
            var _this = this;
            var successCallback = function () {
                return _this.deleteDirectoryImpl(path, callback);
            };
            return this.connectPromise().then(successCallback, callback);
        };
        VFileSystem.prototype.deleteDirectoryImpl = function (path, callback) { };
        // Callback receives a single string argument with error message. null if no error.
        VFileSystem.prototype.download = function (path, localPath, callback) {
            var _this = this;
            var successCallback = function () {
                return _this.downloadImpl(path, localPath, callback);
            };
            return this.connectPromise().then(successCallback, callback);
        };
        VFileSystem.prototype.downloadImpl = function (path, localPath, callback) { };
        VFileSystem.prototype.openFile = function (file) { };
        VFileSystem.prototype.fileOpened = function (file) {
            var hideOnOpen = atom.config.get('atom-commander.panel.hideOnOpen');
            if (hideOnOpen) {
                return this.main.hide();
            }
        };
        // Callback receives two arguments:
        // 1.) err : String with error message. null if no error.
        // 2.) stream : A ReadableStream.
        VFileSystem.prototype.createReadStream = function (path, callback) {
            var _this = this;
            var successCallback = function () {
                return _this.createReadStreamImpl(path, callback);
            };
            var errorCallback = function (err) {
                return callback(err, null);
            };
            return this.connectPromise().then(successCallback, errorCallback);
        };
        VFileSystem.prototype.createReadStreamImpl = function (path, callback) { };
        // The callback receives two parameters :
        // 1.) file : The file that was created. null if it could not be created.
        // 2.) err : The error if the file could not be created.
        VFileSystem.prototype.newFile = function (path, callback) {
            var _this = this;
            var successCallback = function () {
                return _this.newFileImpl(path, callback);
            };
            var errorCallback = function (err) {
                return callback(null, err);
            };
            return this.connectPromise().then(successCallback, errorCallback);
        };
        VFileSystem.prototype.newFileImpl = function (path, callback) { };
        // The callback received three parameters :
        // 1.) The directory.
        // 2.) err if there is an error. null if not.
        // 3.) The list of entries containing VFile and VDirectory instances.
        VFileSystem.prototype.getEntries = function (directory, callback) {
            var _this = this;
            var successCallback = function () {
                return _this.getEntriesImpl(directory, callback);
            };
            var errorCallback = function (err) {
                return callback(directory, err, []);
            };
            return this.connectPromise().then(successCallback, errorCallback);
        };
        VFileSystem.prototype.getEntriesImpl = function (directory, callback) { };
        VFileSystem.prototype.upload = function (localPath, path, callback) {
            var _this = this;
            var successCallback = function () {
                return _this.uploadImpl(localPath, path, callback);
            };
            return this.connectPromise().then(successCallback, callback);
        };
        VFileSystem.prototype.uploadImpl = function (localPath, path, callback) { };
        return VFileSystem;
    }()));
//# sourceMappingURL=vfilesystem.js.map