VDirectory = require '../vdirectory'

module.exports =
class LocalDirectory extends VDirectory

  constructor: (filesystem, @directory) ->
    super(filesystem);

  existsSync: ->
    return @directory.existsSync();

  getRealPathSync: ->
    return @directory.getRealPathSync();

  getBaseName: ->
    return @directory.getBaseName();

  getParent: ->
    return new LocalDirectory(@filesystem, @directory.getParent());

  isRoot: ->
    return @directory.isRoot();

  getEntriesSync: ->
    entries = [];

    for entry in @directory.getEntriesSync()
      if entry.isDirectory()
        entries.push(new LocalDirectory(@filesystem, entry));
      else
        entries.push(new LocalFile(@filesystem, entry));

    return entries;
