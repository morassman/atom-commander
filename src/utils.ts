const PathUtil = require('path')
const SimpleEncryptor = require('simple-encryptor')
// const PasswordDialog = require('./dialogs/password-dialog')
// const FileController = require('./controllers/file-controller')
// const DiffView = require('./views/diff/diff-view')
// const InputDialog = require('./dialogs/input-dialog')

import { VFile, VItem } from './fs'
import * as fsp from 'fs-plus'
import { BaseItemView } from './views/base-item-view'
import { ItemController } from './controllers/item-controller'

export default {

  // Opens a DiffView with the given title. left and right can either
  // be a file or a string.
  // compareFiles(title: string, tooltip: string, left: string | VFile, right: string | VFile) {
  //   const view = new DiffView(title, tooltip, left, right)
  //   const pane = atom.workspace.getActivePane()
  //   const item = pane.addItem(view, { index: 0 })
  //   return pane.activateItem(item)
  // },

  // getFirstFileViewItem(viewItems) {
  //   if (viewItems === null) {
  //     return null
  //   }

  //   for (let viewItem of Array.from(viewItems)) {
  //     if (viewItem.itemController instanceof FileController) {
  //       return viewItem
  //     }
  //   }

  //   return null
  // },

  // sortItems(items) {
  //   return items.sort(function(item1, item2) {
  //     const name1 = item1.getBaseName()
  //     const name2 = item2.getBaseName()

  //     if (name1 < name2) {
  //       return -1
  //     } else if (name1 > name2) {
  //       return 1
  //     }

  //     return 0
  //   })
  // },

  getServersPath() {
    return PathUtil.join(fsp.getHomeDirectory(), '.atom-commander', 'servers')
  },

  // promptForPassword(prompt, callback) {
  //   const dialog = new InputDialog(prompt, null, true, callback)
  //   return dialog.attach()
  // },

  encrypt(text: string, key: string) {
    if (!text || (text.length === 0)) {
      return text
    }

    return SimpleEncryptor(this.padKey(key)).encrypt(text)
  },

  decrypt(text: string, key: string) {
    if (!text || (text.length === 0)) {
      return text
    }

    return SimpleEncryptor(this.padKey(key)).decrypt(text)
  },

  padKey(key: string) {
    while (key.length < 16) {
      key += key
    }

    return key
  },

  showWarning(title: string, message: string, dismissable: boolean) {
    const options: any = {}
    options['dismissable'] = dismissable

    if (message != null) {
      options['detail'] = message
    }

    return atom.notifications.addWarning(title, options)
  },

  showErrorWarning(title: string, pre: string|null, post: string|null, err: Error|null, dismissable: boolean) {
    let message = ''

    if (pre !== null) {
      message = pre
    }

    if ((err !== null) && (err.message !== null)) {
      if (message.length > 0) {
        message += '\n'
      }

      message += err.message
    }

    if (post !== null) {
      message += '\n' + post
    }

    return this.showWarning(title, message, dismissable)
  },

  resolveHome(path: string) {
    if (path.length === 0) {
      return path
    }

    if (path[0] === '~') {
      return PathUtil.join(fsp.getHomeDirectory(), path.slice(1))
    }

    return path
  },

  // @dirs true if the items are directories. false if files.
  // @item Array of BaseItemView to sort.
  // @sortBy Attribute to sort by : 'name', 'ext', 'size', 'date'
  // @ascending true to sort ascending. false for descending.
  sortItemViews(dirs: boolean, items: BaseItemView<ItemController<VItem>>[], sortBy: string, ascending: boolean) {
    if (sortBy === 'name') {
      items.sort(this.itemViewNameComparator)
    } else if (sortBy === 'date') {
      items.sort(this.itemViewDateComparator)
    }

    if (!dirs) {
      if (sortBy === 'extension') {
        items.sort(this.itemViewExtensionComparator)
      } else if (sortBy === 'size') {
        items.sort(this.itemViewSizeComparator)
      }
    }

    if (!ascending) {
      items.reverse()
    }
  },


  itemViewNameComparator(a: any, b?: any) {
    const na = a.itemController.getNamePart()
    const nb = b.itemController.getNamePart()

    if (na < nb) {
      return -1
    }

    if (na > nb) {
      return 1
    }

    return 0
  },

  itemViewExtensionComparator(a: any, b?: any) {
    const na = a.itemController.getExtensionPart()
    const nb = b.itemController.getExtensionPart()

    if (na < nb) {
      return -1
    }

    if (na > nb) {
      return 1
    }

    return 0
  },

  itemViewSizeComparator(a: any, b?: any) {
    const na = a.getItem().getSize()
    const nb = b.getItem().getSize()

    if (na < nb) {
      return -1
    }

    if (na > nb) {
      return 1
    }

    return 0
  },

  itemViewDateComparator(a: any, b?: any) {
    const na = a.getItem().getModifyDate()
    const nb = b.getItem().getModifyDate()

    if (na < nb) {
      return -1
    }

    if (na > nb) {
      return 1
    }

    return 0
  }

}
