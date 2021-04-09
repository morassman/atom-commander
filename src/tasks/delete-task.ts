const fse = require('fs-extra')
const path = require('path')

export default function(folderPath: string, names: string[]) {
  const callback = this.async()

  try {
    for (let name of Array.from(names)) {
      const p = path.join(folderPath, name)
      fse.removeSync(p)
    }
  } catch (error) {
    console.log('Error deleting.')
    console.error(error)
  }

  return callback()
}
