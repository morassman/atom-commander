VSymLink = require '../vsymlink'

module.exports =
class FTPSymLink extends VSymLink

  constructor: (fileSystem, @path, @baseName = null) ->
    super(fileSystem);
    @writable = true;

    if @baseName == null
      @baseName = PathUtil.basename(@path);

  getRealPathSync: ->
    return @path;

  getBaseName: ->
    return @baseName;

  getParent: ->
    return @fileSystem.getDirectory(PathUtil.dirname(@path));

  isWritable: ->
    return @writable;
