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

  abstract getSafeConfig(): C

  isLocal(): boolean {
    return false;
  }

  getName(): string {
    return this.config.name;
  }

  getID(): string {
    return this.getLocalDirectoryName();
  }

}