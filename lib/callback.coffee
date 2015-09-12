module.exports =
class Callback

  constructor: (@wrappedCallback) ->
    @cancelled = false;

  cancel: ->
    @cancelled = true;

  callback: (args...)->
    if !@cancelled
      @wrappedCallback(args);
