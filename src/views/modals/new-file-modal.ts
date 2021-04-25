import { InputModal } from './input-modal'
import Utils from '../../utils'
import { ContainerView } from '../container-view'
import { VDirectory, VFile } from '../../fs'

export function showNewFileModal(containerView: ContainerView, directory: VDirectory, existingNames: string[]) {
  const modal = new InputModal({
    label: 'Enter a name for the new file:',
    callback: (text?: string) => callback(text, containerView, directory),
    validator: (text: string) => validate(text, existingNames),
    hideButtons: true
  })
    
  modal.open()
}

function validate(name: string, existingNames: string[]): string | undefined {
  if (name.length === 0) {
    return 'The file name may not be empty.'
  }

  if (existingNames.indexOf(name) >= 0) {
    return 'A file or folder with this name already exists.'
  }

  return undefined
}

function callback(name: string | undefined, containerView: ContainerView, directory: VDirectory) {
  if (!name) {
    return
  }

  directory.newFile(name, (file: VFile | undefined, err: any) => {
    if (file) {
      containerView.refreshDirectory()
      containerView.highlightIndexWithName(file.getBaseName())
      file.open()
    } else {
      Utils.showErrorWarning('Unable to create file '+name, undefined, undefined, err, true)
    }
  })
}
