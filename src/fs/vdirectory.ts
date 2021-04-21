import { Disposable } from 'atom';
import { NewFileCallback, VFile, VFileSystem, VItem } from './'
import { ItemNameParts } from './vitem';

export abstract class VDirectory extends VItem {

  constructor(fileSystem: VFileSystem) {
    super(fileSystem);
  }

  isFile() {
    return false;
  }

  isDirectory() {
    return true;
  }

  getNamePartsImpl(): ItemNameParts {
    return {
      name: this.getBaseName(),
      ext: ''
    }
  }

  abstract isRoot(): boolean

  abstract onDidChange(callback: ()=>void): Disposable | undefined

  // The callback received three parameters :
  // 1.) This directory.
  // 2.) err. null if no error.
  // 3.) The list of entries containing VFile and VDirectory instances.
  getEntries(callback: (directory: VDirectory, err: any | null, entries: VItem[]) => void) {
    return this.fileSystem.getEntries(this, callback);
  }

  getFile(name: string): VFile | undefined {
    const pathUtil = this.fileSystem.getPathUtil();
    return this.fileSystem.getFile(pathUtil.join(this.getPath(), name));
  }

  // The callback receives one parameter :
  // 1.) file : The file that was created. null if it could not be created.
  newFile(name: string, callback: NewFileCallback) {
    const pathUtil = this.fileSystem.getPathUtil();
    this.fileSystem.newFile(pathUtil.join(this.getPath(), name), callback);
  }

  performOpenAction() {
    this.view.containerView.openDirectory(this)
  }

}