const etch = require('etch')

import { main } from '../../main'
import { Server } from '../../servers/server'
import { Template } from '../element-view'
import { Callback, ItemProvider, ItemRenderer, ListModal, TwoLineRenderer, twoLineRenderer } from './list-modal'

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

  const callback: Callback<Server> = (item?: Server) => {
    if (item) {
      const directory = item.getInitialDirectory()

      if (directory) {
        main.actions.goDirectory(directory)
        return false
      }
    }

    if (fromView) {
      main.mainView?.refocusLastView()
    }

    return false
  }

  showServerModal(itemProvider, twoLineRenderer(renderer), callback)
}

export function showCloseServerModal(fromView: boolean) {
  const itemProvider = () => {
    return main.serverManager.getServers().filter(s => s.isOpen())
  }

  const renderer: TwoLineRenderer<Server> = (item: Server) => {
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

    // '<div style='display: flex'>' +
    //       '<div style='flex: 1'>' +
    //         `<span>${primary}</span>` +
    //         `<span class='text-subtle' style='margin-left: 0.5em'>${count}</span>` +
    //       '</div>' +
    //       '<div class='inline-block highlight-info' style='margin-left: 0.5em'' +
    //         'style='white-space: nowrap overflow: hidden text-overflow: ellipsis'>' +
    //         `${item.server.getUsername()}` +
    //       '</div>' +
    //     '</div>' +

    return {
      primary,
      secondary
    }
  }

  const callback: Callback<Server> = (item?: Server) => {
    if (item) {
      closeServer(item, (confirmed: boolean) => {
        if (confirmed) {
          item.close()
        }

        if (fromView) {
          main.mainView?.refocusLastView()
        }
      })
    }

    return false
  }

  showServerModal(itemProvider, twoLineRenderer(renderer), callback)
}

function closeServer(server: Server, close: (confirmed: boolean)=>void) {
  if (server.getTaskCount() > 0) {
    atom.confirm({
      message: 'Close',
      detail: 'Files on this server are still being accessed. Are you sure you want to close the connection?',
      buttons: ['No', 'Yes']}, (response: number) => {
        close(response === 1)
      })
  } else {
    close(true)
  }
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

function showServerModal(itemProvider: ItemProvider<Server>, renderer: ItemRenderer<Server>, callback: Callback<Server>) {
  const filterKeyForItem = (item: Server) => {
    return `${item.getName()} ${item.getDescription()}`
  }

  const modal = new ListModal<Server>(itemProvider, renderer, filterKeyForItem, callback)
  modal.open()
}
