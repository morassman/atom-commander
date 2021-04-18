import { main } from '../../main'
import { VItem } from '../../fs'
import { InputModal } from './input-modal'

export function showAddBookmarkModal(item: VItem, fromView: boolean) {
  const modal = new InputModal({
    label: `Enter a name for the bookmark (may be empty): ${item.getPath()}`,
    callback: (text: string | null) => callback(text, item, fromView),
    value: item.getBaseName(),
    hideButtons: true
  })
    
  modal.show()
}

function callback(name: string | null, item: VItem, fromView: boolean) {
  if (!name) {
    return
  }

  main.getBookmarkManager().addBookmark(name, item);

  if (fromView) {
    main.mainView.refocusLastView();
  }
}
