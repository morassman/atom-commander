import { VFileSystem } from './vfilesystem';
import { VItem } from './vitem'

export class VSymLink extends VItem {

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

  existsSync() {
    return true;
  }

  isLink() {
    return true;
  }

  setModifyDate(modifyDate) {
    this.modifyDate = modifyDate;
    return (this.controller != null ? this.controller.refresh() : undefined);
  }

  setSize(size) {
    this.size = size;
    return (this.controller != null ? this.controller.refresh() : undefined);
  }

  // This is called once it is known that the symlink points to file.
  setTargetFilePath(targetPath) {
    return this.setTargetItem(this.createFileItem(targetPath));
  }

  // This is called once it is known that the symlink points to directory.
  setTargetDirectoryPath(targetPath) {
    return this.setTargetItem(this.createDirectoryItem(targetPath));
  }

  // Overwrite to create a VFile for the file pointed to by this symlink.
  createFileItem(targetPath) { }

  // Overwrite to create a VDirectory for the directory pointed to by this symlink.
  createDirectoryItem(targetPath) { }
});
