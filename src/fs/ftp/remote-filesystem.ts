import { VFileSystem } from '../'
import { Server } from '../../servers/server';
import { RemoteConfig } from './remote-config'

export abstract class RemoteFileSystem<C extends RemoteConfig = RemoteConfig> extends VFileSystem {

  constructor(public readonly server: Server, public readonly config: C) {
    super()
  }

  abstract getLocalDirectoryName(): string

  abstract getDisplayName(): string

  abstract getDescription(): string

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