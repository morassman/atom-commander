const etch = require('etch')

import { EditServerModal } from '.'
import { main } from '../../main'
import { Server } from '../../servers/server'
import { Template } from '../element-view'
import { ItemCallback, ItemProvider, ItemRenderer, ListModal, TwoLineRenderer, twoLineRenderer } from './list-modal'

const rendererWithCacheCount: TwoLineRenderer<Server> = (item: Server) => {
  const name = item.getName()
  const description = item.getDescription()

  let primaryText: string = ''
  let secondary: string | undefined = undefined

  if (name && name.length > 0) {
    primaryText = name
    secondary = description
  } else {
    primaryText = description
  }

  const count = '(' + createFilesInCacheString(item) + ')'

  const primaryJSX = <div attributes={{style: 'display: flex'}}>
    <div attributes={{style: 'flex: 1'}}>
      <span>{primaryText}</span>
      <span className='text-subtle' attributes={{style: 'margin-left: 0.5em'}}>{count}</span>
    </div>
    <div className='inline-block highlight-info' attributes={{style: 'margin-left: 0.5em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis'}}>
      {item.getUsername()}
    </div>
  </div>

  const primary = new Template({}, primaryJSX)

  return {
    primary,
    secondary
  }
}


export function showOpenServerModal(fromView: boolean) {
  const itemProvider = () => {
    return main.serverManager.getServers()
  }

  const renderer: TwoLineRenderer<Server> = (item: Server) => {
    return {
      primary: item.getName(),
      secondary: item.getDescription()
    }
  }

  const callback: ItemCallback<Server> = (item?: Server) => {
    if (item) {
      const directory = item.getInitialDirectory()

      if (directory) {
        main.actions.goDirectory(directory)
        return false
      }
    }

    return false
  }

  showServerModal(fromView, itemProvider, twoLineRenderer(renderer), callback)
}

export function showCloseServerModal(fromView: boolean) {
  const itemProvider = () => {
    return main.serverManager.getServers().filter(s => s.isOpen())
  }

  const callback: ItemCallback<Server> = (item?: Server) => {
    if (item) {
      return closeServer(item)
    }

    return true
  }

  showServerModal(fromView, itemProvider, twoLineRenderer(rendererWithCacheCount), callback)
}

function closeServer(server: Server): boolean | Promise<boolean> {
  const confirmed = () => {
    server.close()
  }

  if (server.getTaskCount() > 0) {
    return new Promise((resolve: (value: boolean)=>void) => {
      atom.confirm({
        message: 'Close',
        detail: 'Files on this server are still being accessed. Are you sure you want to close the connection?',
        buttons: ['No', 'Yes']}, (response: number) => {
          if (response === 1) {
            confirmed()
          }
          resolve(true)
        })
    })
  } else {
    confirmed()
  }

  return true
}

export function showEditServerModal(fromView: boolean) {
  const itemProvider = () => {
    return main.serverManager.getServers()
  }

  const callback: ItemCallback<Server> = (item?: Server) => {
    if (item) {
      if (item.isOpen()) {
        atom.notifications.addWarning('The server must be closed before it can be edited.')
      } else if (item.getOpenFileCount() > 0) {
        atom.notifications.addWarning('A server cannot be edited while its files are being accessed.')
      } else {
        const view = fromView ? main.mainView?.focusedView : undefined
        const modal = new EditServerModal(view, item)
        modal.open()
      }
    }

    return false
  }

  showServerModal(fromView, itemProvider, twoLineRenderer(rendererWithCacheCount), callback)
}

export function showRemoveServerModal(fromView: boolean) {
  const itemProvider = () => {
    return main.serverManager.getServers()
  }

  const callback: ItemCallback<Server> = (item?: Server) => {
    if (item) {
      return removeServer(item)
    }

    return false
  }

  showServerModal(fromView, itemProvider, twoLineRenderer(rendererWithCacheCount), callback)
}

function removeServer(server: Server): boolean | Promise<boolean> {
  const removeConfirmed = () => {
    main.serverManager.removeServer(server)
  }

  if (server.getOpenFileCount() > 0) {
    atom.notifications.addWarning('A server cannot be removed while its files are being edited.')
    return true
  }

  let question: string | undefined = undefined
  const taskCount = server.getTaskCount()
  const fileCount = server.getCacheFileCount()

  if (fileCount > 0) {
    question = 'There are still files in the cache. Removing the server will clear the cache.'
  } else if (taskCount > 0) {
    question = 'Files on this server are still being accessed. Removing the server will also clear the cache.'
  }

  if (question) {
    return new Promise((resolve: (value: boolean) => void) => {
      atom.confirm({
        message: 'Remove',
        detail: question+' Are you sure you want to remove the server?',
        buttons: ['No', 'Yes']},
        (response: number) => {
          if (response === 1) {
            removeConfirmed()
          }
          resolve(true)
        })
    })
  }

  removeConfirmed()
  return true
}

function createFilesInCacheString(server: Server) {
  const count = server.getCacheFileCount()

  if (count === 1) {
    return '1 file in cache'
  }

  return count+' files in cache'
}

// export function showRemoveServerModal(fromView: boolean) {
//   const callback: Callback<Bookmark> = (item?: Bookmark) => {
//     let keepOpen = false

//     if (item) {
//       main.getBookmarkManager().removeBookmark(item)
//       keepOpen = main.getBookmarkManager().bookmarks.length > 0
//     }

//     if (!keepOpen && fromView) {
//       main.mainView?.refocusLastView()
//     }

//     return keepOpen
//   }

//   showBookmarkModal(callback)
// }

function showServerModal(fromView: boolean, itemProvider: ItemProvider<Server>, renderer: ItemRenderer<Server>, callback: ItemCallback<Server>) {
  const filterKeyForItem = (item: Server) => {
    return `${item.getName()} ${item.getDescription()}`
  }

  const afterClose = () => {
    if (fromView) {
      main.mainView?.refocusLastView()
    }
  }

  const modal = new ListModal<Server>(itemProvider, renderer, filterKeyForItem, callback, afterClose)
  modal.open()
}
