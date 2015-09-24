queue = require 'queue'

module.exports =
class FSTaskManager

  constructor: (@fileSystem) ->
    @q = queue();

  download: (path, localPath, callback) ->
    # @q.push (cb) =>
    #   cb();
    #
    # @q.start();
