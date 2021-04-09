const fsp = require('fs-plus')
const fse = require('fs-extra')
const path = require('path')
const {Directory, File} = require('atom')

declare function emit(event: string, data: any): void

export default function(srcFolderPath: string, srcNames: string[], dstFolderPath: string, move=false) {
  const callback = this.async()
  const dstDirectory = new Directory(dstFolderPath)

  try {
    let index = 0

    for (let srcName of Array.from(srcNames)) {
      const srcPath = path.join(srcFolderPath, srcName)
      const dstPath = path.join(dstFolderPath, srcName)

      const srcIsDir = fsp.isDirectorySync(srcPath)

      // Prevent a folder from being moved into itself.
      const stop = move && (dstPath.indexOf(srcPath) === 0)

      const options: any = {}
      options.clobber = true

      if (!stop) {
        // TODO : Prompt user to choose if file should be replaced.
        // The src will be copied if:
        // - src is a folder
        // - src is a file and dst isn't a file
        // if srcIsDir or !fsp.isFileSync(dstPath)
        if (move) {
          fsp.moveSync(srcPath, dstPath)
        } else {
          fse.copySync(srcPath, dstPath, options)
        }

        // TODO
        emit('success', {index})
      }

      index++
    }
  } catch (error) {
    console.log('Error copying.')
    console.error(error)
  }

  return callback()
}
