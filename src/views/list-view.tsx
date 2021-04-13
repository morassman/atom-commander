const etch = require('etch')

import { main } from '../main'
import { Props, View } from './view'
import { ContainerView } from './container-view'
import { DirectoryController } from '../controllers/directory-controller'
import { FileController } from '../controllers/file-controller'
import { SymLinkController } from '../controllers/symlink-controller'
import { ListDirectoryView } from './list-directory-view'
import { ListFileView } from './list-file-view'
import { ListSymLinkView } from './list-symlink-view'
import { ListItemView } from './list-item-view'
import { VItem } from '../fs'
import { ItemController } from '../controllers/item-controller'
// const ListFileView = require('./list-file-view')
// const ListDirectoryView = require('./list-directory-view')
// const ListSymLinkView = require('./list-symlink-view')
// const ContainerView = require('./container-view')

class TableBodyView extends View {

  render() {
    return <tbody className='atom-commander-list-view list' tabindex={-1}/>
  }
}

type BodyViewRefs = {
  
  scroller: HTMLElement
  
  table: HTMLElement

  tableBody: TableBodyView

  nameHeader: HTMLElement

  extensionHeader: HTMLElement

  sizeHeader: HTMLElement

  dateHeader: HTMLElement

  name: HTMLElement

  extension: HTMLElement

  size: HTMLElement

  date: HTMLElement

}

class BodyView extends View<Props, BodyViewRefs> {

  constructor(private requestFocus: ()=>void) {
    super({}, true)
  }

  render() {
    return <div ref='scroller' className='atom-commander-list-view-scroller' on={{click: () => this.requestFocus()}}>
      <table ref='table' className='atom-commander-list-view-table'>
        <thead>
          <tr>
            <th ref='nameHeader' on={{click: () => main.actions.sortByName()}}>
              <span ref='name' className='sort-icon icon'>Name</span>
            </th>
            <th ref='extensionHeader' on={{click: () => main.actions.sortByExtension()}}>
              <span ref='extension' className='sort-icon icon'>Extension</span>
            </th>
            <th ref='sizeHeader' on={{click: () => main.actions.sortBySize()}}>
              <span ref='size' className='sort-icon icon'>Size</span>
            </th>
            <th ref='dateHeader' on={{click: () => main.actions.sortByDate()}}>
              <span ref='date' className='sort-icon icon'>Date</span>
            </th>
          </tr>
        </thead>
        <TableBodyView ref='tableBody' className='atom-commander-list-view list' tabindex={-1}/>
      </table>
    </div>
  }
}

export class ListView extends ContainerView {

  body: BodyView

  constructor(left: boolean) {
    super({left})
    this.body = new BodyView(() => this.requestFocus())
    this.initialize()
  }

  container(): BodyView {
    return this.body
  }

  // static container() {
  //   // @div {class: 'atom-commander-list-view-resizer', click:'requestFocus', outlet: 'listViewResizer'}, =>
  //   return this.div({class: 'atom-commander-list-view-scroller', outlet:'scroller', click:'requestFocus'}, () => {
  //     return this.table({class: 'atom-commander-list-view-table', outlet: 'table'}, () => {
  //       return this.tbody({class: 'atom-commander-list-view list', tabindex: -1, outlet: 'tableBody'})
  //   })
  // })
  // }

  // initialize(state){
  //   super.initialize(state)

  //   return this.tableBody.focusout(() => {
  //     return this.refreshHighlight()
  //   })
  // }

  clearItemViews() {
    this.body.refs.tableBody.clear()

    this.setExtensionColumnVisible(this.isExtensionColumnVisible())
    this.setSizeColumnVisible(this.isSizeColumnVisible())
    this.setDateColumnVisible(this.isDateColumnVisible())
  }

  createParentView(index: number, directoryController: DirectoryController): ListDirectoryView {
    return new ListDirectoryView(this, index, true, directoryController)
  }

  createFileView(index: number, fileController: FileController): ListFileView {
    return new ListFileView(this, index, fileController)
  }

  createDirectoryView(index: number, directoryController: DirectoryController): ListDirectoryView {
    return new ListDirectoryView(this, index, false, directoryController)
  }

  createSymLinkView(index: number, symLinkController: SymLinkController): ListSymLinkView {
    return new ListSymLinkView(this, index, symLinkController)
  }

  addItemView(itemView: ListItemView<ItemController<VItem>>) {
    if (!this.isSizeColumnVisible()) {
      itemView.setSizeColumnVisible(false)
    }

    if (!this.isDateColumnVisible()) {
      itemView.setDateColumnVisible(false)
    }

    itemView.setExtensionColumnVisible(this.isExtensionColumnVisible())

    this.body.refs.tableBody.append(itemView)
  }

  focus() {
    this.body.refs.tableBody.element.focus()
    super.focus()
  }

  hasContainerFocus() {
    return document.activeElement === this.body.refs.tableBody.element
  }

  pageUp() {
    this.pageAdjust(true)
  }

  pageDown() {
    this.pageAdjust(false)
  }

  pageAdjust(up: boolean) {
    // TODO
    // if (!this.highlightedIndex || (this.itemViews.length === 0)) {
    //   return
    // }

    // const itemViewHeight = this.body.refs.tableBody.height() / this.itemViews.length

    // if (itemViewHeight === 0) {
    //   return
    // }

    // const scrollHeight = this.body.refs.scroller.scrollBottom() - this.body.refs.scroller.scrollTop()
    // const itemsPerPage = Math.round(scrollHeight / itemViewHeight)

    // if (up) {
    //   this.highlightIndex(this.highlightedIndex - itemsPerPage)
    // } else {
    //   this.highlightIndex(this.highlightedIndex + itemsPerPage)
    // }
  }

  adjustContentHeight(change: number) {}
    // @listViewResizer.height(@listViewResizer.outerHeight() + change)

  getContentHeight(): number {
    return 0
  }
    // return @listViewResizer.height()

  setContentHeight(contentHeight: number) {}
    // @listViewResizer.height(contentHeight)

  getScrollTop(): number {
    return this.body.refs.scroller.scrollTop
  }

  setScrollTop(scrollTop: number) {
    return this.body.refs.scroller.scrollTop = scrollTop
  }

  setExtensionColumnVisible(visible: boolean) {
    // TODO
    // if (visible) {
    //   this.body.refs.table.find('tr :nth-child(2)').show()
    // } else {
    //   this.body.refs.table.find('tr :nth-child(2)').hide()
    // }

    this.refreshItemViews()
  }

  setSizeColumnVisible(visible: boolean) {
    // TODO
    // if (visible) {
    //   return this.body.refs.table.find('tr :nth-child(3)').show()
    // } else {
    //   return this.body.refs.table.find('tr :nth-child(3)').hide()
    // }
  }

  setDateColumnVisible(visible: boolean) {
    // TODO
    // if (visible) {
    //   return this.body.refs.table.find('tr :nth-child(4)').show()
    // } else {
    //   return this.body.refs.table.find('tr :nth-child(4)').hide()
    // }
  }

  refreshSortIcons(sortBy: string, ascending: boolean) {
    const element = (this.body.refs as any)[sortBy]

    if (element == null) {
      return
    }

    element.removeClass('icon-chevron-up')
    element.removeClass('icon-chevron-down')

    if (ascending) {
      element.addClass('icon-chevron-down')
    } else {
      element.addClass('icon-chevron-up')
    }

    element.show()
  }
}
