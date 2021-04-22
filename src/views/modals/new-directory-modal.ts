import { InputModal } from './input-modal'
import { ContainerView } from '../container-view'
import { VDirectory } from '../../fs'
import fsp from 'fs-plus'

export function showNewDirectoryModal(containerView: ContainerView, directory: VDirectory) {
  const modal = new InputModal({
    label: 'Enter a name for the new folder:',
    callback: (text?: string) => callback(text, containerView, directory),
    validator: (text: string) => validate(text, directory),
    hideButtons: true
  })

  modal.show()
}

function validate(name: string, directory: VDirectory): string | undefined {
  if (name.length === 0) {
    return 'The folder name may not be empty.'
  }

  if (directory.fileSystem.isLocal()) {
    const pathUtil = directory.getFileSystem().getPathUtil()

    if (fsp.isDirectorySync(pathUtil.join(directory.getPath(), name))) {
      return 'A folder with this name already exists.'
    }
  }

  return undefined
}

function callback(name: string | undefined, containerView: ContainerView, directory: VDirectory) {
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
