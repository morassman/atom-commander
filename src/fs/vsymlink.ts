import { VFileSystem } from './vfilesystem'
import { ItemNameParts, VItem } from './vitem'
import { VFile } from './vfile'
import { VDirectory } from '.'

export abstract class VSymLink extends VItem {

  targetItem?: VItem

  constructor(fileSystem: VFileSystem) {
    super(fileSystem)
  }

  setTargetItem(targetItem: VItem) {
    this.targetItem = targetItem

    if (this.targetItem) {
      this.targetItem.setView(this.view)
    }

    this.refreshView()
  }

  getTargetItem(): VItem | undefined {
    return this.targetItem
  }

  isFile(): boolean {
    return this.targetItem ? this.targetItem.isFile() : false
  }

  isDirectory() {
    return this.targetItem ? this.targetItem.isDirectory() : false
  }

  existsSync(): boolean {
    return true
  }

  isLink(): boolean {
    return true
  }

  getNamePartsImpl(): ItemNameParts {
    return this.targetItem ? this.targetItem.getNameParts() : { name: '', ext: ''}
  }

  setModifyDate(modifyDate: Date) {
    this.modifyDate = modifyDate
    this.refreshView()
  }

  setSize(size: number) {
    this.size = size
    this.refreshView()
  }

  // This is called once it is known that the symlink points to file.
  setTargetFilePath(targetPath: string) {
    this.setTargetItem(this.createFileItem(targetPath))
  }

  // This is called once it is known that the symlink points to directory.
  setTargetDirectoryPath(targetPath: string) {
    this.setTargetItem(this.createDirectoryItem(targetPath))
  }

  performOpenAction() {
    if (this.targetItem) {
      this.targetItem.performOpenAction()
    }
  }

  // Overwrite to create a VFile for the file pointed to by this symlink.
  abstract createFileItem(targetPath: string): VFile

  // Overwrite to create a VDirectory for the directory pointed to by this symlink.
  abstract createDirectoryItem(targetPath: string): VDirectory

}
