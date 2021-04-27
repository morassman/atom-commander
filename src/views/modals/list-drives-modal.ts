import { Directory } from 'atom'
import { ItemCallback, ListModal, twoLineRenderer } from './list-modal'
import { list } from 'drivelist'

interface Item {

  primary: string

  secondary: string

  path: string

  filter: string

}

export function showListDriveModal(callback: ItemCallback<Directory | undefined>) {
  const itemCallback = (item?: Item): boolean | Promise<boolean> => {
    return callback(item ? new Directory(item.path) : undefined)
  }

  getItems().then(items => showListDriveModalImpl(items, itemCallback))
}

async function getItems(): Promise<Item[]> {
  if (process.platform === 'darwin') {
    return getDarwinItems()
  } else if (process.platform === 'win32') {
    return getWindowsItems()
  }

  return getLinuxItems()
}

function getDarwinItems(): Item[] {
  const items: Item[] = []
  const directory = new Directory('/Volumes')

  for (let entry of directory.getEntriesSync()) {
    if (entry.isDirectory()) {
      const volume = entry.getBaseName()
      
      items.push({
        path: `/Volumes/${volume}`,
        primary: volume,
        secondary: `/Volumes/${volume}`,
        filter: volume
      })
    }
  }

  return items
}

async function getWindowsItems(): Promise<Item[]> {
  const drives = await list()
  const items: Item[] = []

  drives.forEach(disk => {
    if (!disk.mountpoints || disk.mountpoints.length === 0) {
      return
    }

    const mountPoint = disk.mountpoints[0]

    items.push({
      path: `${mountPoint.path}\\`,
      primary: mountPoint.path,
      secondary: disk.description,
      filter: `${mountPoint.path} ${disk.description}`
    })
  })

  return items
}

async function getLinuxItems(): Promise<Item[]> {
  const drives = await list()
  const items: Item[] = []

  drives.forEach(disk => {
    if (!disk.mountpoints || disk.mountpoints.length === 0) {
      return
    }

    const mountPoint = disk.mountpoints[0]

    items.push({
      path: mountPoint.path,
      primary: mountPoint.path,
      secondary: disk.description,
      filter: `${mountPoint.path} ${disk.description}`
    })
  })

  return items
}


function showListDriveModalImpl(items: Item[], callback: ItemCallback<Item>) {
  const elementForItem = twoLineRenderer<Item>((i: Item) => {
    return {
      primary: i.primary,
      secondary: i.secondary
    }
  })

  const filterKeyForItem = (item: Item) => {
    return item.filter
  }

  const itemProvider = () => {
    return items
  }

  const modal = new ListModal<Item>(itemProvider, elementForItem, filterKeyForItem, callback)
  modal.open()
}
