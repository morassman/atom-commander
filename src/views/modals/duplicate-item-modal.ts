import { InputModal } from './input-modal'
import Utils from '../../utils'
import { ContainerView } from '../container-view'
import { VItem } from '../../fs'
import * as fse from 'fs-extra'

export function showDuplicateItemModal(containerView: ContainerView, item: VItem) {
  const modal = new InputModal({
    label: 'Enter a name for the duplicate:',
    callback: (text: string | null) => callback(text, containerView, item),
    validator: (text: string) => validate(text, containerView),
    hideButtons: true,
    value: item.getBaseName()
  })
    
  modal.show()
}

function validate(name: string, containerView: ContainerView): string | null {
  if (name.length === 0) {
    return 'The name may not be empty.'
  }

  const existingItemView = containerView.getItemViewWithName(name)

  if (!existingItemView) {
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

function callback(name: string | null, containerView: ContainerView, item: VItem) {
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



// /*
//  * decaffeinate suggestions:
//  * DS002: Fix invalid constructor
//  * DS102: Remove unnecessary code created because of implicit returns
//  * DS207: Consider shorter variations of null checks
//  * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
//  */
// let DuplicateFileDialog
// const Utils = require('../utils')
// const fse = require('fs-extra')
// const InputDialog = require('@aki77/atom-input-dialog')

// module.exports =
// (DuplicateFileDialog = class DuplicateFileDialog extends InputDialog {

//   constructor(containerView, item) {
//     containerView = containerView
//     item = item
//     super({prompt:'Enter a name for the duplicate:'})
//   }

//   initialize() {
//     directory = item.getParent()

//     const options = {}
//     options.defaultText = item.getBaseName()

//     options.callback = text => {
//       const name = text.trim()
//       const pathUtil = directory.getFileSystem().getPathUtil()
//       const newPath = pathUtil.join(directory.getPath(), name)

//       return fse.copy(item.getPath(), newPath, function(err) {
//         if (err != null) {
//           return Utils.showWarning('Error duplicating '+item.getPath()+'.', err.message, true)
//         }
//       })
//     }

//     options.validate = function(text) {
//       const name = text.trim()

//       if (name.length === 0) {
//         return 'The name may not be empty.'
//       }

//       const existingItemView = containerView.getItemViewWithName(name)

//       if (existingItemView === null) {
//         return null
//       }

//       const existingItem = existingItemView.getItem()

//       if (existingItem.isFile()) {
//         return 'A file with this name already exists.'
//       } else if (existingItem.isDirectory()) {
//         return 'A folder with this name already exists.'
//       }

//       return null
//     }

//     return super.initialize(options)
//   }
// })
