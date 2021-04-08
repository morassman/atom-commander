import { VFileSystem } from '../'
import { Server } from '../../servers/server';

export abstract class RemoteFileSystem extends VFileSystem {

  constructor(public readonly server: Server, public readonly config: any) {
    super()
  }

  abstract getLocalDirectoryName(): string

  abstract getDisplayName(): string

  isLocal() {
    return false;
  }

  getName() {
    return this.config.name;
  }


  getID() {
    return this.getLocalDirectoryName();
  }

}