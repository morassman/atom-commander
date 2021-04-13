/*
 * decaffeinate suggestions:
 * DS002: Fix invalid constructor
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let ServersView
const CacheView = require('./cache/cache-view')
const EditServerDialog = require('../dialogs/edit-server-dialog')
const {Directory} = require('atom')
const {SelectListView} = require('atom-space-pen-views')

module.exports =
(ServersView = class ServersView extends SelectListView {

  constructor(actions, mode, fromView) {
    this.actions = actions
    this.mode = mode
    this.fromView = fromView
    super()
  }

  initialize() {
    super.initialize()

    this.serverManager = this.actions.main.getServerManager()

    this.addClass('overlay from-top')
    this.refreshItems()

    if (this.panel == null) { this.panel = atom.workspace.addModalPanel({item: this}) }
    this.panel.show()
    return this.focusFilterEditor()
  }

  refreshItems() {
    const items = []
    // Only show those that have an open connection.
    const onlyOpen = this.mode === 'close'
    const showCount = this.showCount()

    for (let server of Array.from(this.serverManager.getServers())) {
      if (!onlyOpen || server.isOpen()) {
        const item = {}
        item.server = server
        item.fileCount = 0
        item.name = server.getName()
        item.description = server.getDescription()
        item.filter = item.name + ' ' + item.description

        if (showCount) {
          item.fileCount = item.server.getCacheFileCount()
        }
          // item.text += ' ('+@createCountString(item.fileCount)+')'

        items.push(item)
      }
    }

    this.setItems(items)
    return items
  }

  createCountString(count) {
    if (count === 1) {
      return '1 file in cache'
    }

    return count+' files in cache'
  }

  getFilterKey() {
    return 'filter'
  }

  showCount() {
    return this.mode !== 'open'
  }

  viewForItem(item) {
    let primary = ''
    let secondary = ''
    let count = ''

    if (item.name.length > 0) {
      primary = item.name
      secondary = item.description
    } else {
      primary = item.description
    }

    if (this.showCount()) {
      count = '(' + this.createCountString(item.fileCount) + ')'
    }

    return '<li class='two-lines'>' +
      '<div class='primary-line'>' +
        '<div style='display: flex'>' +
          '<div style='flex: 1'>' +
            `<span>${primary}</span>` +
            `<span class='text-subtle' style='margin-left: 0.5em'>${count}</span>` +
          '</div>' +
          '<div class='inline-block highlight-info' style='margin-left: 0.5em'' +
            'style='white-space: nowrap overflow: hidden text-overflow: ellipsis'>' +
            `${item.server.getUsername()}` +
          '</div>' +
        '</div>' +
      '</div>' +
      `<div class='secondary-line'>${secondary}</div>` +
    '</li>'
  }

  confirmed(item) {
    if (this.mode === 'open') {
      return this.confirmOpen(item)
    } else if (this.mode === 'close') {
      return this.confirmClose(item)
    } else if (this.mode === 'remove') {
      return this.confirmRemove(item)
    } else if (this.mode === 'cache') {
      return this.confirmCache(item)
    } else if (this.mode === 'edit') {
      return this.confirmEdit(item)
    }
  }

  confirmOpen(item) {
    this.cancel()
    return this.actions.goDirectory(item.server.getInitialDirectory())
  }

  confirmClose(item) {
    const confirmed = () => {
      item.server.close()
      const items = this.refreshItems()
      if (items.length === 0) {
        return this.cancel()
      }
    }

    if (item.server.getTaskCount() > 0) {
      const response = atom.confirm({
        message: 'Close',
        detailedMessage: 'Files on this server are still being accessed. Are you sure you want to close the connection?',
        buttons: ['No', 'Yes']})

      if (response === 1) {
        return confirmed()
      }
    } else {
      return confirmed()
    }
  }


  confirmRemove(item) {
    if (item.server.getOpenFileCount() > 0) {
      atom.notifications.addWarning('A server cannot be removed while its files are being edited.')
      return
    }

    let question = null
    const taskCount = item.server.getTaskCount()

    if (item.fileCount > 0) {
      question = 'There are still files in the cache. Removing the server will clear the cache.'
    } else if (taskCount > 0) {
      question = 'Files on this server are still being accessed. Removing the server will also clear the cache.'
    }

    const confirmed = () => {
      this.serverManager.removeServer(item.server)
      if (this.serverManager.getServerCount() === 0) {
        return this.cancel()
      } else {
        return this.refreshItems()
      }
    }

    if (question !== null) {
      const response = atom.confirm({
        message: 'Remove',
        detailedMessage: question+' Are you sure you want to remove the server?',
        buttons: ['No', 'Yes']})

      if (response === 1) {
        return confirmed()
      }
    } else {
      return confirmed()
    }
  }

  confirmCache(item) {
    this.cancel()

    const view = new CacheView(item.server)
    const pane = atom.workspace.getActivePane()
    item = pane.addItem(view, {index: 0})
    return pane.activateItem(item)
  }

  confirmEdit(item) {
    this.cancel()

    if (item.server.isOpen()) {
      atom.notifications.addWarning('The server must be closed before it can be edited.')
      return
    }

    if (item.server.getOpenFileCount() > 0) {
      atom.notifications.addWarning('A server cannot be edited while its files are being accessed.')
      return
    }


    const dialog = new EditServerDialog(item.server)
    return dialog.attach()
  }

  cancelled() {
    this.hide()
    if (this.panel) {
      this.panel.destroy()
    }

    if (this.fromView) {
      return this.actions.main.mainView.refocusLastView()
    }
  }
})
