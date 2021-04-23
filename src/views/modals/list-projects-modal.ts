import { Directory } from 'atom';
import { Callback, ListModal, twoLineRenderer } from './list-modal';

export function showListProjectsModal(callback: Callback<Directory | undefined>) {
  const items = atom.project.getDirectories()

  const elementForItem = twoLineRenderer<Directory>((p: Directory) => {
    return p.getBaseName()
  }, (p: Directory) => {
    return p.getRealPathSync()
  })

  const filterKeyForItem = (item: Directory) => {
    return item.getRealPathSync()
  }

  const itemProvider = () => {
    return items
  }

  const modal = new ListModal<Directory>(itemProvider, elementForItem, filterKeyForItem, callback)
  modal.open()
}
