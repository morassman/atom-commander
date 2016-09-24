fs = require 'fs'
SSH2 = require 'ssh2'
Utils = require '../../utils'

module.exports =
class SFTPSession

  constructor: (@fileSystem) ->
    @config = @fileSystem.config;
    @clientConfig = @fileSystem.clientConfig;

    @client = null;
    @ssh2 = null;
    @open = null;

  getClient: ->
    return @client;

  connect: ->
    if @clientConfig.loginWithPassword
      if @clientConfig.password?
        @connectWithPassword(@clientConfig.password);
        return;
    else # Login with private key.
      if @clientConfig.usePassphrase
        if @clientConfig.passphrase
          @connectWithPassphrase(@clientConfig.passphrase);
          return;
      else
        @connectWithPrivateKey();
        return;

    # If this point is reached then either a password or a passphrase needs to be entered.

    prompt = "Enter ";
    if @clientConfig.loginWithPassword
      promtp += "password for ";
    else
      prompt += "passphrase for ";
    prompt += @clientConfig.username;
    prompt += "@";
    prompt += @clientConfig.host;
    prompt += ":"

    Utils.promptForPassword prompt, (input) =>
      if input?
        if @clientConfig.loginWithPassword
          @connectWithPassword(input);
        else
          @connectWithPassphrase(input);
      else
        err = {};
        err.canceled = true;
        err.message = "Incorrect credentials for "+@clientConfig.host;
        @fileSystem.emitError(err);
        @canceled();

  connectWithPassword: (password) ->
    @connectWith(password, undefined);

  connectWithPrivateKey: ->
    @connectWith(undefined, undefined);

  connectWithPassphrase: (passphrase) ->
    @connectWith(undefined, passphrase);

  # All connectWith? functions boil down to this one.
  #
  # password: The password that should be used. undefined if not logging in with password.
  # passphrase: The passphrase to use when loggin in with a private key. undefined if it shouldn't be used.
  connectWith: (privateKey, password, passphrase) ->
    @client = null;
    @ssh2 = new SSH2();

    @ssh2.on "ready", =>
      @ssh2.sftp (err, sftp) =>
        if err?
          @fileSystem.emitError(err);
          @close();
          return;

        @client = sftp;

        @client.on "end", =>
          @close();

        # If the connection was successful then remember the password for
        # the rest of the session.
        if password?
          @clientConfig.password = password;

        if passphrase?
          @clientConfig.passphrase = passphrase;

        if @config.storePassword
          if password?
            @config.password = password;
          if passphrase?
            @config.passphrase = passphrase;
          @config.passwordDecrypted = true;

        @opened();

    @ssh2.on "error", (err) =>
      if err.level == "client-authentication"
        delete @clientConfig.password;
        atom.notifications.addWarning("Incorrect credentials for "+@clientConfig.host);
        @connect();
      else
        @fileSystem.emitError(err);

    @ssh2.on "close", =>
      @close();

    @ssh2.on "end", =>
      @close();

    @ssh2.on "keyboard-interactive", (name, instructions, instructionsLang, prompt, finish) =>
      finish([password]);

    connectConfig = {};

    for key, val of @clientConfig
      connectConfig[key] = val;

    connectConfig.password = password;
    connectConfig.passphrase = passphrase;

    console.log(connectConfig);

    @ssh2.connect(connectConfig);

  disconnect: ->
    if @client?
      @client.end();
      @client = null;

    if @ssh2?
      @ssh2.end();
      @ssh2 = null;

    @close();

  opened: ->
    @open = true;
    @fileSystem.sessionOpened(@);

  canceled: ->
    @disconnect();
    @fileSystem.sessionCanceled(@);

  close: ->
    if @open
      @open = false;
      @fileSystem.sessionClosed(@);
