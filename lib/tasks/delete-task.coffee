fsp = require 'fs-plus'
fse = require 'fs-extra'
path = require 'path'

module.exports = (folderPath, names) ->
  callback = @async()

  try
    for name in names
      p = path.join(folderPath, name);
      fse.removeSync(p);
  catch error
    console.log("Error deleting.");
    console.error(error);

  callback();
