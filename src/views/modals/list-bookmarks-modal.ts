import { Bookmark } from '../../bookmark-manager';
import { main } from '../../main'
import { Callback, ListModal, twoLineRenderer } from './list-modal';

export function showOpenBookmarkModal(fromView: boolean) {
  const callback: Callback<Bookmark> = (item?: Bookmark) => {
    if (item) {
      main.getActions().goBookmark(item)
    }

    if (fromView) {
      main.mainView.refocusLastView()
    }

    return false
  }

  showBookmarkModal(callback)
}

export function showRemoveBookmarkModal(fromView: boolean) {
  const callback: Callback<Bookmark> = (item?: Bookmark) => {
    let keepOpen = false

    if (item) {
      main.getBookmarkManager().removeBookmark(item)
      keepOpen = main.getBookmarkManager().bookmarks.length > 0
    }

    if (!keepOpen && fromView) {
      main.mainView.refocusLastView()
    }

    return keepOpen
  }

  showBookmarkModal(callback)
}

function showBookmarkModal(callback: Callback<Bookmark>) {
  const elementForItem = twoLineRenderer<Bookmark>((b: Bookmark) => {
    if (!b.name || b.name.length === 0) {
      return `${b.name}: ${b.pathDescription.uri}`
    }

    return b.name
  }, (b: Bookmark) => {
    return !b.name || b.name.length === 0 ? undefined : b.pathDescription.uri
  })

  const filterKeyForItem = (item: Bookmark) => {
    if (!item.name || item.name.length === 0) {
      return item.pathDescription.uri
    }

    return `${item.name}: ${item.pathDescription.uri}`
  }

  const itemProvider = () => {
    return main.bookmarkManager.bookmarks
  }

  const modal = new ListModal<Bookmark>(itemProvider, elementForItem, filterKeyForItem, callback)
  modal.open()
}
