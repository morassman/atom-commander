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

  # Called if connecting failed due to invalid credentials. This will only try
  # to connect again if a password or passphrase should be prompted for.
  reconnect: (err) ->
    delete @clientConfig.password;
    delete @clientConfig.passphrase;

    if @config.loginWithPassword or @config.usePassphrase
      @connect();
    else
      @fileSystem.emitError(err);
      @canceled();

  connect: ->
    password = @clientConfig.password;
    passphrase = @clientConfig.passphrase;

    if !password?
      password = '';

    if !passphrase?
      passphrase = '';

    if @config.loginWithPassword
      @connectWith(password, passphrase);
      return;

    if @config.usePassphrase and passphrase.length > 0
      @connectWith(password, passphrase);
      return;

    if !@config.usePassphrase
      @connectWith(password, passphrase);

    # Only the passphrase needs to be prompted for. The password will
    # be prompted for by ssh2.

    prompt = "Enter passphrase for ";
    prompt += @clientConfig.username;
    prompt += "@";
    prompt += @clientConfig.host;
    prompt += ":"

    Utils.promptForPassword prompt, (input) =>
      if input?
        @connectWith(password, input);
      else
        err = {};
        err.canceled = true;
        err.message = "Incorrect credentials for "+@clientConfig.host;
        @fileSystem.emitError(err);
        @canceled();

  # All connectWith? functions boil down to this one.
  #
  # password: The password that should be used. empty if not logging in with password.
  # passphrase: The passphrase to use when loggin in with a private key. empty if it shouldn't be used.
  connectWith: (password, passphrase) ->
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
        if password.length > 0
          @clientConfig.password = password;

        if passphrase.length > 0
          @clientConfig.passphrase = passphrase;

        @opened();

    @ssh2.on "error", (err) =>
      if err.level == "client-authentication"
        atom.notifications.addWarning("Incorrect credentials for "+@clientConfig.host);
        err = {};
        err.canceled = false;
        err.message = "Incorrect credentials for "+@clientConfig.host;
        @reconnect(err);
      else
        @fileSystem.emitError(err);

    @ssh2.on "close", =>
      @close();

    @ssh2.on "end", =>
      @close();

    @ssh2.on "keyboard-interactive", (name, instructions, instructionsLang, prompt, finish) =>
      if password.length > 0
        finish([password]);
      else
        prompts = prompt.map (p) -> p.prompt;
        values = [];
        @prompt(0, prompts, values, finish);

    connectConfig = {};

    for key, val of @clientConfig
      connectConfig[key] = val;

    connectConfig.password = password;
    connectConfig.passphrase = passphrase;

    if (connectConfig.password.length == 0)
      delete connectConfig['password'];

    if (connectConfig.passphrase.length == 0)
      delete connectConfig['passphrase'];

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

  prompt: (index, prompts, values, finish) ->
    Utils.promptForPassword prompts[index], (input) =>
      if input?
        values.push(input);
        if prompts.length == (index + 1)
          finish(values);
        else
          @prompt(index + 1, prompts, values, finish);
      else
        err = {};
        err.canceled = true;
        err.message = "Incorrect credentials for "+@clientConfig.host;
        @fileSystem.emitError(err);
        @canceled();
