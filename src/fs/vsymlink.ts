import { VFileSystem } from './vfilesystem';
import { VItem } from './vitem'
import { VFile } from './vfile'

export abstract class VSymLink extends VItem {

  targetItem: VItem

  constructor(fileSystem: VFileSystem) {
    super(fileSystem)
  }

  setTargetItem(targetItem: VItem) {
    this.targetItem = targetItem;

    if (this.controller) {
      this.controller.refresh();
    }
  }

  getTargetItem(): VItem {
    return this.targetItem;
  }

  isFile(): boolean {
    return this.targetItem ? this.targetItem.isFile() : false
  }

  isDirectory() {
    return this.targetItem ? this.targetItem.isDirectory() : false
  }

  existsSync(): boolean {
    return true;
  }

  isLink(): boolean {
    return true;
  }

  setModifyDate(modifyDate: Date) {
    this.modifyDate = modifyDate;

    if (this.controller) {
      this.controller.refresh()
    }
  }

  setSize(size: number) {
    this.size = size;

    if (this.controller) {
      this.controller.refresh()
    }
  }

  // This is called once it is known that the symlink points to file.
  setTargetFilePath(targetPath: string) {
    this.setTargetItem(this.createFileItem(targetPath));
  }

  // This is called once it is known that the symlink points to directory.
  setTargetDirectoryPath(targetPath: string) {
    return this.setTargetItem(this.createDirectoryItem(targetPath));
  }

  // Overwrite to create a VFile for the file pointed to by this symlink.
  abstract createFileItem(targetPath: string): VFile

  // Overwrite to create a VDirectory for the directory pointed to by this symlink.
  abstract createDirectoryItem(targetPath: string): VFile

}
