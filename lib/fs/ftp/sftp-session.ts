/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let SFTPSession;
const fs = require('fs');
const SSH2 = require('ssh2');
const Utils = require('../../utils');

module.exports =
(SFTPSession = class SFTPSession {

  constructor(fileSystem) {
    this.fileSystem = fileSystem;
    this.config = this.fileSystem.config;
    this.clientConfig = this.fileSystem.clientConfig;

    this.client = null;
    this.ssh2 = null;
    this.open = null;
  }

  getClient() {
    return this.client;
  }

  // Called if connecting failed due to invalid credentials. This will only try
  // to connect again if a password or passphrase should be prompted for.
  reconnect(err) {
    delete this.clientConfig.password;
    delete this.clientConfig.passphrase;

    if (this.config.loginWithPassword || this.config.usePassphrase) {
      return this.connect();
    } else {
      this.fileSystem.emitError(err);
      return this.canceled();
    }
  }

  connect() {
    let {
      password
    } = this.clientConfig;
    let {
      passphrase
    } = this.clientConfig;

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

    let prompt = "Enter passphrase for ";
    prompt += this.clientConfig.username;
    prompt += "@";
    prompt += this.clientConfig.host;
    prompt += ":";

    return Utils.promptForPassword(prompt, input => {
      if (input != null) {
        return this.connectWith(password, input);
      } else {
        const err = {};
        err.canceled = true;
        err.message = "Incorrect credentials for "+this.clientConfig.host;
        this.fileSystem.emitError(err);
        return this.canceled();
      }
    });
  }

  // All connectWith? functions boil down to this one.
  //
  // password: The password that should be used. empty if not logging in with password.
  // passphrase: The passphrase to use when loggin in with a private key. empty if it shouldn't be used.
  connectWith(password, passphrase) {
    this.client = null;
    this.ssh2 = new SSH2();

    this.ssh2.on("ready", () => {
      return this.ssh2.sftp((err, sftp) => {
        if (err != null) {
          this.fileSystem.emitError(err);
          this.close();
          return;
        }

        this.client = sftp;

        this.client.on("end", () => {
          return this.close();
        });

        // If the connection was successful then remember the password for
        // the rest of the session.
        if (password.length > 0) {
          this.clientConfig.password = password;
        }

        if (passphrase.length > 0) {
          this.clientConfig.passphrase = passphrase;
        }

        return this.opened();
      });
    });

    this.ssh2.on("error", err => {
      if (err.level === "client-authentication") {
        atom.notifications.addWarning("Incorrect credentials for "+this.clientConfig.host);
        err = {};
        err.canceled = false;
        err.message = "Incorrect credentials for "+this.clientConfig.host;
        return this.reconnect(err);
      } else {
        return this.fileSystem.emitError(err);
      }
    });

    this.ssh2.on("close", () => {
      return this.close();
    });

    this.ssh2.on("end", () => {
      return this.close();
    });

    this.ssh2.on("keyboard-interactive", (name, instructions, instructionsLang, prompt, finish) => {
      if (password.length > 0) {
        return finish([password]);
      } else {
        const prompts = prompt.map(p => p.prompt);
        const values = [];
        return this.prompt(0, prompts, values, finish);
      }
    });

    const connectConfig = {};

    for (let key in this.clientConfig) {
      const val = this.clientConfig[key];
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
  }

  disconnect() {
    if (this.client != null) {
      this.client.end();
      this.client = null;
    }

    if (this.ssh2 != null) {
      this.ssh2.end();
      this.ssh2 = null;
    }

    return this.close();
  }

  opened() {
    this.open = true;
    return this.fileSystem.sessionOpened(this);
  }

  canceled() {
    this.disconnect();
    return this.fileSystem.sessionCanceled(this);
  }

  close() {
    if (this.open) {
      this.open = false;
      return this.fileSystem.sessionClosed(this);
    }
  }

  prompt(index, prompts, values, finish) {
    return Utils.promptForPassword(prompts[index], input => {
      if (input != null) {
        values.push(input);
        if (prompts.length === (index + 1)) {
          return finish(values);
        } else {
          return this.prompt(index + 1, prompts, values, finish);
        }
      } else {
        const err = {};
        err.canceled = true;
        err.message = "Incorrect credentials for "+this.clientConfig.host;
        this.fileSystem.emitError(err);
        return this.canceled();
      }
    });
  }
});
