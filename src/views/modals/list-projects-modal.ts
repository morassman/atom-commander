import { Directory } from 'atom';
import { ItemCallback, ListModal, twoLineRenderer } from './list-modal';

export function showListProjectsModal(callback: ItemCallback<Directory | undefined>) {
  const items = atom.project.getDirectories()

  const elementForItem = twoLineRenderer<Directory>((p: Directory) => {
    return {
      primary: p.getBaseName(),
      secondary: p.getRealPathSync()
    }
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
