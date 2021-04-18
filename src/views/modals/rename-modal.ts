import { InputModal } from './input-modal'
import { ContainerView } from '../container-view'
import { VItem } from '../../fs'

export function showRenameModal(containerView: ContainerView, item: VItem) {
  const parent = item.getParent()

  if (!parent) {
    return
  }

  const itemName = item.getBaseName()
  const oldPath = item.getRealPathSync()
  const directoryPath = parent.getRealPathSync()
  const pathUtil = item.getFileSystem().getPathUtil()

  const modal = new InputModal({
    label: 'Enter a new name:',
    callback: (text: string | null) => callback(text, containerView, item, pathUtil, oldPath, directoryPath),
    validator: (text: string) => validate(text, containerView, pathUtil, itemName),
    hideButtons: true,
    value: itemName
  })

  modal.show()
}

function validate(name: string, containerView: ContainerView, pathUtil: any, itemName: string): string | null {
  if (name === itemName) {
    return null
  }

  if (name.length === 0) {
    return 'The name may not be empty.'
  }

  const parsed = pathUtil.parse(name)

  if (parsed.dir !== '') {
    return 'The name should not contain a parent.'
  }

  const existingItemView = containerView.getItemViewWithName(name)

  if (existingItemView === null) {
    return null
  }

  const existingItem = existingItemView.getItem()

  if (existingItem.isFile()) {
    return 'A file with this name already exists.'
  } else if (existingItem.isDirectory()) {
    return 'A folder with this name already exists.'
  }

  return null
}

function callback(name: string | null, containerView: ContainerView, item: VItem, pathUtil: any, oldPath: string, directoryPath: string) {
  if (!name) {
    return
  }

  const newPath = pathUtil.join(directoryPath, name)

  if (oldPath === newPath) {
    return
  }

  item.fileSystem.rename(oldPath, newPath, err => {
    if (err) {
      atom.notifications.addWarning(err)
    } else {
      // TODO : It's not necessary to refresh the whole directory. Just update the item.
      containerView.refreshDirectory()
    }
  })

  containerView.requestFocus()
}
