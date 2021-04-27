const PathUtil = require('path')
const SimpleEncryptor = require('simple-encryptor')
import { NotificationOptions } from 'atom'
// const PasswordDialog = require('./dialogs/password-dialog')
// const DiffView = require('./views/diff/diff-view')
// const InputDialog = require('./dialogs/input-dialog')

import fsp from 'fs-plus'
import { VFile, VItem } from './fs'
import { ItemView } from './views/item-view'
import { InputModal } from './views/modals'

export default {

  // Opens a DiffView with the given title. left and right can either
  // be a file or a string.
  compareFiles(title: string, tooltip: string, left: string | VFile, right: string | VFile) {
    // TODO
  //   const view = new DiffView(title, tooltip, left, right)
  //   const pane = atom.workspace.getActivePane()
  //   const item = pane.addItem(view, { index: 0 })
  //   return pane.activateItem(item)
  },

  getFirstFileViewItem(itemViews: ItemView[]): ItemView | undefined {
    if (!itemViews) {
      return undefined
    }

    for (let itemView of itemViews) {
      if (itemView.item.isFile() && !itemView.item.isLink()) {
        return itemView
      }
    }

    return undefined
  },

  sortItems(items: VItem[]) {
    return items.sort(function(item1: VItem, item2: VItem) {
      const name1 = item1.getBaseName()
      const name2 = item2.getBaseName()

      if (name1 < name2) {
        return -1
      } else if (name1 > name2) {
        return 1
      }

      return 0
    })
  },

  getServersPath() {
    return PathUtil.join(fsp.getHomeDirectory(), '.atom-commander', 'servers')
  },

  promptForPassword(prompt: string, callback: (text?: string)=>void) {
    const modal = new InputModal({
      label: prompt,
      callback,
      password: true
    })

    modal.open()
  },

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
    const options: NotificationOptions = {
      dismissable,
      detail: message
    }

    return atom.notifications.addWarning(title, options)
  },

  showErrorWarning(title: string, pre: string|undefined, post: string|undefined, err: Error|undefined, dismissable: boolean) {
    let message = ''

    if (pre) {
      message = pre
    }

    if (err && err.message) {
      if (message.length > 0) {
        message += '\n'
      }

      message += err.message
    }

    if (post) {
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
  sortItemViews(dirs: boolean, items: ItemView[], sortBy: string, ascending: boolean) {
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


  itemViewNameComparator(a: ItemView, b: ItemView) {
    const na = a.item.getNamePart()
    const nb = b.item.getNamePart()

    if (na < nb) {
      return -1
    }

    if (na > nb) {
      return 1
    }

    return 0
  },

  itemViewExtensionComparator(a: ItemView, b: ItemView) {
    const na = a.item.getExtensionPart()
    const nb = b.item.getExtensionPart()

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
