import { InputDialog } from './input-dialog'
import { ContainerView } from '../container-view'
import { VDirectory } from '../../fs'
import * as fsp from 'fs-plus'

export function showNewDirectoryDialog(containerView: ContainerView, directory: VDirectory) {
  const dialog = new InputDialog({
    label: 'Enter a name for the new folder:',
    callback: (text: string | null) => callback(text, containerView, directory),
    validator: (text: string) => validate(text, directory),
    hideButtons: true
  })

  dialog.show()
}

function validate(name: string, directory: VDirectory): string | null {
  if (name.length === 0) {
    return 'The folder name may not be empty.'
  }

  if (directory.fileSystem.isLocal()) {
    const pathUtil = directory.getFileSystem().getPathUtil()

    if (fsp.isDirectorySync(pathUtil.join(directory.getPath(), name))) {
      return 'A folder with this name already exists.'
    }
  }

  return null
}

function callback(name: string | null, containerView: ContainerView, directory: VDirectory) {
  if (!name) {
    return
  }

  const pathUtil = directory.getFileSystem().getPathUtil()
  const path = pathUtil.join(directory.getPath(), name)

  directory.fileSystem.makeDirectory(path, err => {
    if (err) {
      atom.notifications.addWarning(err)
    } else {
      const snapShot = {
        name
      }
      containerView.refreshDirectoryWithSnapShot(snapShot)
    }
  })
}
