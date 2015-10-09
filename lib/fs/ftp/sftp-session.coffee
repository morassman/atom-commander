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
    if @clientConfig.password?
      @connectWithPassword(@clientConfig.password);
    else
      prompt = "Enter password for ";
      prompt += @clientConfig.username;
      prompt += "@";
      prompt += @clientConfig.host;
      prompt += ":"

      Utils.promptForPassword prompt, (password) =>
        if password?
          @connectWithPassword(password);
        else
          err = {};
          err.canceled = true;
          err.message = "Incorrect credentials for "+@clientConfig.host;
          @fileSystem.emitError(err);
          @canceled();
          # @disconnect();

  connectWithPassword: (password) ->
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
        @clientConfig.password = password;

        if @config.storePassword
          @config.password = password;
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
