import { ErrorCallback } from '../../fs'
import { RemoteConfig } from '../../fs/ftp/remote-config'
import { main } from '../../main'
import { Server } from '../../servers/server'
import { Props, View } from '../view'

export abstract class ServerModal<R extends object = {}> extends View<Props, R> {

  /**
   * 
   * @param server undefined when creating a new server. Set when editing an existing server.
   */
  constructor(protected readonly server?: Server) {
    super({}, false)
  }

  anotherServerExists(id: string): boolean {
    if (this.server && this.server.fileSystem.getID() === id) {
      return false
    }

    return main.getServerManager().getFileSystemWithID(id) !== undefined
  }

  abstract onConfigChange(): void

  abstract open(): void

  abstract close(): void

}

export type ValidateResult = {
  message: string
  level: 'ok' | 'warning' | 'error'
}

export type ServerConfigProps = Props & {

  parent: ServerModal

}

export abstract class ServerConfigView<C extends RemoteConfig = RemoteConfig, P extends ServerConfigProps = ServerConfigProps, R extends object = {}> extends View<P, R> {

  constructor(props: P, init=true) {
    super(props, init)
  }

  abstract setConfig(config: C): void

  abstract getConfig(): C

  abstract validate(): ValidateResult

  abstract selected(): void

  abstract test(callback: ErrorCallback): void

  abstract cancelTest(): void

}