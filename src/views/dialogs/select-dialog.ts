import { ContainerView } from '../container-view'
import { InputDialog } from './input-dialog'

export function showSelectDialog(containerView: ContainerView, add: boolean) {
  const label = add ? 'Select items that matches the pattern:' : 'Deselect items that matches the pattern:'
  const validator = (text: string) => text.length === 0 ? 'The pattern may not be empty.' : null

  const dialog = new InputDialog({
    label,
    callback: (text: string | null) => callback(text, containerView, add),
    validator,
    value: '*',
    hideButtons: true
  })
    
  dialog.show()
}

function callback(pattern: string | null, containerView: ContainerView, add: boolean) {
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
