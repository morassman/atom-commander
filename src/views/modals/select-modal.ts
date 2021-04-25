import { ContainerView } from '../container-view'
import { InputModal } from './input-modal'

export function showSelectModal(containerView: ContainerView, add: boolean) {
  const label = add ? 'Select items that matches the pattern:' : 'Deselect items that matches the pattern:'
  const validator = (text: string) => text.length === 0 ? 'The pattern may not be empty.' : undefined

  const modal = new InputModal({
    label,
    callback: (text?: string) => callback(text, containerView, add),
    validator,
    value: '*',
    hideButtons: true
  })
    
  modal.open()
}

function callback(pattern: string | undefined, containerView: ContainerView, add: boolean) {
  if (!pattern) {
    return
  }
  
  const itemViews = containerView.getItemViewsWithPattern(pattern)

  itemViews.forEach(itemView => {
    if (itemView.isSelectable()) {
      itemView.select(add)
    }
  })
}
