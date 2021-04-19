const etch = require('etch')

import { main } from '../main'
import { Props, View } from './view'
import { ContainerView } from './container-view'
import { DirectoryController } from '../controllers/directory-controller'
import { FileController } from '../controllers/file-controller'
import { SymLinkController } from '../controllers/symlink-controller'
import { DirectoryView } from './directory-view'
import { FileView } from './file-view'
import { SymLinkView } from './symlink-view'
import { VItem } from '../fs'
import { ItemController } from '../controllers/item-controller'
import { TBody } from './element-view'
import { ItemView } from './item-view'
// const ListFileView = require('./list-file-view')
// const ListDirectoryView = require('./list-directory-view')
// const ListSymLinkView = require('./list-symlink-view')
// const ContainerView = require('./container-view')

type BodyViewRefs = {
  
  scroller: HTMLElement
  
  table: HTMLElement

  tableBody: TBody

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
    return <div ref='scroller' className='atom-commander-list-view-scroller' onClick={() => this.requestFocus()}>
      <table ref='table' className='atom-commander-list-view-table' attributes={{tabindex:-1}}>
        <thead>
          <tr>
            <th ref='nameHeader' onClick={() => main.actions.sortByName()}>
              <span ref='name' className='sort-icon icon'>Name</span>
            </th>
            <th ref='extensionHeader' onClick={() => main.actions.sortByExtension()}>
              <span ref='extension' className='sort-icon icon'>Extension</span>
            </th>
            <th ref='sizeHeader' onClick={() => main.actions.sortBySize()}>
              <span ref='size' className='sort-icon icon'>Size</span>
            </th>
            <th ref='dateHeader' onClick={() => main.actions.sortByDate()}>
              <span ref='date' className='sort-icon icon'>Date</span>
            </th>
          </tr>
        </thead>
        <TBody ref='tableBody' className='atom-commander-list-view list'/>
      </table>
    </div>
  }

  refreshSortIcons(sortBy: string, ascending: boolean) {
    for (let e of [this.refs.name, this.refs.extension, this.refs.size, this.refs.date]) {
      e.classList.remove('icon-chevron-up')
      e.classList.remove('icon-chevron-down')
    }

    const element = (this.refs as any)[sortBy] as HTMLElement

    if (!element) {
      return
    }

    if (ascending) {
      element.classList.add('icon-chevron-down')
    } else {
      element.classList.add('icon-chevron-up')
    }

    // TODO
    // element.show()
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

  createParentView(index: number, directoryController: DirectoryController): DirectoryView {
    return new DirectoryView(this, index, true, directoryController)
  }

  createFileView(index: number, fileController: FileController): FileView {
    return new FileView(this, index, fileController)
  }

  createDirectoryView(index: number, directoryController: DirectoryController): DirectoryView {
    return new DirectoryView(this, index, false, directoryController)
  }

  createSymLinkView(index: number, symLinkController: SymLinkController): SymLinkView {
    return new SymLinkView(this, index, symLinkController)
  }

  addItemView(itemView: ItemView) {
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
    this.body.refs.table.focus()
    super.focus()
  }

  hasContainerFocus() {
    return document.activeElement === this.body.refs.table
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
    super.setExtensionColumnVisible(visible)
    this.setHeaderVisible(this.body.refs.extensionHeader, visible)
    // this.refreshItemViews()
  }

  setSizeColumnVisible(visible: boolean) {
    super.setSizeColumnVisible(visible)
    this.setHeaderVisible(this.body.refs.sizeHeader, visible)
  }

  setDateColumnVisible(visible: boolean) {
    super.setDateColumnVisible(visible)
    this.setHeaderVisible(this.body.refs.dateHeader, visible)
  }

  setHeaderVisible(header: HTMLElement, visible: boolean) {
    header.style.display = visible ? 'table-cell' : 'none'
  }

  refreshSortIcons(sortBy: string, ascending: boolean) {
    this.body.refreshSortIcons(sortBy, ascending)
  }
}
