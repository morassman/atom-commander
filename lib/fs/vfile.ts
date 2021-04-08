import { ErrorCallback, VFileSystem, VItem } from '.';

export abstract class VFile extends VItem {

  constructor(fileSystem: VFileSystem) {
    super(fileSystem);
  }

  isFile() {
    return true;
  }

  isDirectory() {
    return false;
  }

  download(localPath: string, callback: ErrorCallback) {
    const taskManager = this.getFileSystem().getTaskManager()

    if (taskManager) {
      taskManager.getFileSystem().download(this.getPath(), localPath, callback)
    }
  }

  upload(localPath: string, callback: ErrorCallback) {
    const taskManager = this.getFileSystem().getTaskManager()

    if (taskManager) {
      taskManager.getFileSystem().upload(localPath, this.getPath(), callback)
    }
  }

  open() {
    return this.fileSystem.openFile(this);
  }

  // Callback receives two arguments:
  // 1.) err : String with error message. null if no error.
  // 2.) stream : A ReadableStream.
  createReadStream(callback: (error: string | null, stream: ReadableStream | null) => void) {
    this.fileSystem.createReadStream(this.getPath(), callback);
  }

}
