"use strict";
exports.__esModule = true;
exports.VFileSystem = void 0;
var q = require('q');
var atom_1 = require("atom");
var task_manager_1 = require("./task-manager");
var VFileSystem = /** @class */ (function () {
    function VFileSystem(main) {
        this.main = main;
        this.emitter = new atom_1.Emitter();
        this.taskManager = null;
        this.connecting = false;
        this.connected = false;
    }
    VFileSystem.prototype.getMain = function () {
        return this.main;
    };
    VFileSystem.prototype.getTaskManager = function (create) {
        if (create === void 0) { create = true; }
        if (!this.taskManager && create) {
            this.taskManager = new task_manager_1.TaskManager(this.clone());
        }
        return this.taskManager;
    };
    VFileSystem.prototype.getTaskCount = function () {
        return this.taskManager ? this.taskManager.getTaskCount() : 0;
    };
    VFileSystem.prototype.dispose = function () {
        this.emitter.dispose();
    };
    VFileSystem.prototype.connectPromise = function () {
        var deferred = q.defer();
        if (this.isConnected()) {
            deferred.resolve();
            return deferred.promise;
        }
        var disposables = new atom_1.CompositeDisposable();
        disposables.add(this.onConnected(function () {
            disposables.dispose();
            deferred.resolve();
        }));
        disposables.add(this.onError(function (err) {
            disposables.dispose();
            deferred.reject(err);
        }));
        this.connect();
        return deferred.promise;
    };
    VFileSystem.prototype.onConnected = function (callback) {
        return this.emitter.on("connected", callback);
    };
    VFileSystem.prototype.onDisconnected = function (callback) {
        return this.emitter.on("disconnected", callback);
    };
    // Callback receives a single 'err' parameter.
    VFileSystem.prototype.onError = function (callback) {
        return this.emitter.on("error", callback);
    };
    VFileSystem.prototype.emitConnected = function () {
        this.emitter.emit("connected");
    };
    VFileSystem.prototype.emitDisconnected = function () {
        this.emitter.emit("disconnected");
    };
    VFileSystem.prototype.emitError = function (err) {
        this.emitter.emit("error", err);
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
        if (err) {
            this.emitError(err);
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
            this.emitConnected();
        }
        else {
            this.emitDisconnected();
        }
    };
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
    // Callback receives a single string argument with error message. null if no error.
    VFileSystem.prototype.rename = function (oldPath, newPath, callback) {
        var _this = this;
        var successCallback = function () {
            _this.renameImpl(oldPath, newPath, callback);
        };
        this.connectPromise().then(successCallback, callback);
    };
    // Callback receives a single string argument with error message. null if no error.
    VFileSystem.prototype.makeDirectory = function (path, callback) {
        var _this = this;
        var successCallback = function () {
            return _this.makeDirectoryImpl(path, callback);
        };
        return this.connectPromise().then(successCallback, callback);
    };
    // Callback receives a single string argument with error message. null if no error.
    VFileSystem.prototype.deleteFile = function (path, callback) {
        var _this = this;
        var successCallback = function () {
            _this.deleteFileImpl(path, callback);
        };
        this.connectPromise().then(successCallback, callback);
    };
    // Callback receives a single string argument with error message. null if no error.
    VFileSystem.prototype.deleteDirectory = function (path, callback) {
        var _this = this;
        var successCallback = function () {
            _this.deleteDirectoryImpl(path, callback);
        };
        this.connectPromise().then(successCallback, callback);
    };
    // Callback receives a single string argument with error message. null if no error.
    VFileSystem.prototype.download = function (path, localPath, callback) {
        var _this = this;
        var successCallback = function () {
            _this.downloadImpl(path, localPath, callback);
        };
        this.connectPromise().then(successCallback, callback);
    };
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
            _this.createReadStreamImpl(path, callback);
        };
        var errorCallback = function (err) {
            callback(err, null);
        };
        this.connectPromise().then(successCallback, errorCallback);
    };
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
    // The callback received three parameters :
    // 1.) The directory.
    // 2.) err if there is an error. null if not.
    // 3.) The list of entries containing VFile and VDirectory instances.
    VFileSystem.prototype.getEntries = function (directory, callback) {
        var _this = this;
        var successCallback = function () {
            _this.getEntriesImpl(directory, callback);
        };
        var errorCallback = function (err) {
            callback(directory, err, []);
        };
        this.connectPromise().then(successCallback, errorCallback);
    };
    // TODO : callback type
    VFileSystem.prototype.upload = function (localPath, path, callback) {
        var _this = this;
        var successCallback = function () {
            return _this.uploadImpl(localPath, path, callback);
        };
        return this.connectPromise().then(successCallback, callback);
    };
    return VFileSystem;
}());
exports.VFileSystem = VFileSystem;
//# sourceMappingURL=vfilesystem.js.map