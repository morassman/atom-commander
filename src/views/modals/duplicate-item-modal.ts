import { InputModal } from './input-modal'
import Utils from '../../utils'
import { ContainerView } from '../container-view'
import { VItem } from '../../fs'
import fse from 'fs-extra'

export function showDuplicateItemModal(containerView: ContainerView, item: VItem) {
  const modal = new InputModal({
    label: 'Enter a name for the duplicate:',
    callback: (text?: string) => callback(text, item),
    validator: (text: string) => validate(text, containerView),
    hideButtons: true,
    value: item.getBaseName()
  })
    
  modal.show()
}

function validate(name: string, containerView: ContainerView): string | undefined {
  if (name.length === 0) {
    return 'The name may not be empty.'
  }

  const existingItemView = containerView.getItemViewWithName(name)

  if (!existingItemView) {
    return undefined
  }

  const existingItem = existingItemView.getItem()

  if (existingItem.isFile()) {
    return 'A file with this name already exists.'
  } else if (existingItem.isDirectory()) {
    return 'A folder with this name already exists.'
  }

  return undefined
}

function callback(name: string | undefined, item: VItem) {
  if (!name) {
    return
  }

  const directory = item.getParent()

  if (!directory) {
    return
  }

  const pathUtil = directory.getFileSystem().getPathUtil()
  const newPath = pathUtil.join(directory.getPath(), name)

  fse.copy(item.getPath(), newPath, (err: Error) => {
    if (err) {
      Utils.showWarning(`Error duplicating ${item.getPath()}.`, err.message, true)
    }
  })
}
