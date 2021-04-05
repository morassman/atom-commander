/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var SFTPSession;
var fs = require('fs');
var SSH2 = require('ssh2');
var Utils = require('../../utils');
module.exports =
    (SFTPSession = /** @class */ (function () {
        function SFTPSession(fileSystem) {
            this.fileSystem = fileSystem;
            this.config = this.fileSystem.config;
            this.clientConfig = this.fileSystem.clientConfig;
            this.client = null;
            this.ssh2 = null;
            this.open = null;
        }
        SFTPSession.prototype.getClient = function () {
            return this.client;
        };
        // Called if connecting failed due to invalid credentials. This will only try
        // to connect again if a password or passphrase should be prompted for.
        SFTPSession.prototype.reconnect = function (err) {
            delete this.clientConfig.password;
            delete this.clientConfig.passphrase;
            if (this.config.loginWithPassword || this.config.usePassphrase) {
                return this.connect();
            }
            else {
                this.fileSystem.emitError(err);
                return this.canceled();
            }
        };
        SFTPSession.prototype.connect = function () {
            var _this = this;
            var password = this.clientConfig.password;
            var passphrase = this.clientConfig.passphrase;
            if ((password == null)) {
                password = '';
            }
            if ((passphrase == null)) {
                passphrase = '';
            }
            if (this.config.loginWithPassword) {
                this.connectWith(password, passphrase);
                return;
            }
            if (this.config.usePassphrase && (passphrase.length > 0)) {
                this.connectWith(password, passphrase);
                return;
            }
            if (!this.config.usePassphrase) {
                this.connectWith(password, passphrase);
                return;
            }
            // Only the passphrase needs to be prompted for. The password will
            // be prompted for by ssh2.
            var prompt = "Enter passphrase for ";
            prompt += this.clientConfig.username;
            prompt += "@";
            prompt += this.clientConfig.host;
            prompt += ":";
            return Utils.promptForPassword(prompt, function (input) {
                if (input != null) {
                    return _this.connectWith(password, input);
                }
                else {
                    var err = {};
                    err.canceled = true;
                    err.message = "Incorrect credentials for " + _this.clientConfig.host;
                    _this.fileSystem.emitError(err);
                    return _this.canceled();
                }
            });
        };
        // All connectWith? functions boil down to this one.
        //
        // password: The password that should be used. empty if not logging in with password.
        // passphrase: The passphrase to use when loggin in with a private key. empty if it shouldn't be used.
        SFTPSession.prototype.connectWith = function (password, passphrase) {
            var _this = this;
            this.client = null;
            this.ssh2 = new SSH2();
            this.ssh2.on("ready", function () {
                return _this.ssh2.sftp(function (err, sftp) {
                    if (err != null) {
                        _this.fileSystem.emitError(err);
                        _this.close();
                        return;
                    }
                    _this.client = sftp;
                    _this.client.on("end", function () {
                        return _this.close();
                    });
                    // If the connection was successful then remember the password for
                    // the rest of the session.
                    if (password.length > 0) {
                        _this.clientConfig.password = password;
                    }
                    if (passphrase.length > 0) {
                        _this.clientConfig.passphrase = passphrase;
                    }
                    return _this.opened();
                });
            });
            this.ssh2.on("error", function (err) {
                if (err.level === "client-authentication") {
                    atom.notifications.addWarning("Incorrect credentials for " + _this.clientConfig.host);
                    err = {};
                    err.canceled = false;
                    err.message = "Incorrect credentials for " + _this.clientConfig.host;
                    return _this.reconnect(err);
                }
                else {
                    return _this.fileSystem.emitError(err);
                }
            });
            this.ssh2.on("close", function () {
                return _this.close();
            });
            this.ssh2.on("end", function () {
                return _this.close();
            });
            this.ssh2.on("keyboard-interactive", function (name, instructions, instructionsLang, prompt, finish) {
                if (password.length > 0) {
                    return finish([password]);
                }
                else {
                    var prompts = prompt.map(function (p) { return p.prompt; });
                    var values = [];
                    return _this.prompt(0, prompts, values, finish);
                }
            });
            var connectConfig = {};
            for (var key in this.clientConfig) {
                var val = this.clientConfig[key];
                connectConfig[key] = val;
            }
            connectConfig.password = password;
            connectConfig.passphrase = passphrase;
            if (connectConfig.password.length === 0) {
                delete connectConfig['password'];
            }
            if (connectConfig.passphrase.length === 0) {
                delete connectConfig['passphrase'];
            }
            return this.ssh2.connect(connectConfig);
        };
        SFTPSession.prototype.disconnect = function () {
            if (this.client != null) {
                this.client.end();
                this.client = null;
            }
            if (this.ssh2 != null) {
                this.ssh2.end();
                this.ssh2 = null;
            }
            return this.close();
        };
        SFTPSession.prototype.opened = function () {
            this.open = true;
            return this.fileSystem.sessionOpened(this);
        };
        SFTPSession.prototype.canceled = function () {
            this.disconnect();
            return this.fileSystem.sessionCanceled(this);
        };
        SFTPSession.prototype.close = function () {
            if (this.open) {
                this.open = false;
                return this.fileSystem.sessionClosed(this);
            }
        };
        SFTPSession.prototype.prompt = function (index, prompts, values, finish) {
            var _this = this;
            return Utils.promptForPassword(prompts[index], function (input) {
                if (input != null) {
                    values.push(input);
                    if (prompts.length === (index + 1)) {
                        return finish(values);
                    }
                    else {
                        return _this.prompt(index + 1, prompts, values, finish);
                    }
                }
                else {
                    var err = {};
                    err.canceled = true;
                    err.message = "Incorrect credentials for " + _this.clientConfig.host;
                    _this.fileSystem.emitError(err);
                    return _this.canceled();
                }
            });
        };
        return SFTPSession;
    }()));
//# sourceMappingURL=sftp-session.js.map