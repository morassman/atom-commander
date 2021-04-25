import { ErrorCallback } from '../../fs'
import { RemoteConfig } from '../../fs/ftp/remote-config'
import { main } from '../../main'
import { Props, View } from '../view'

export abstract class ServerModal<R extends object = {}> extends View<Props, R> {

  constructor() {
    super({})
  }

  serverExists(id: string): boolean {
    return main.getServerManager().getFileSystemWithID(id) !== undefined
  }

  abstract onConfigChange(configView: ServerConfigView): void

  abstract open(): void

  abstract close(): void

}

export type ValidateResult = {
  message: string
  level: 'ok' | 'warning' | 'error'
}

export abstract class ServerConfigView<P extends Props = Props, R extends object = {}> extends View<P, R> {

  constructor(props: P, init=true) {
    super(props, init)
  }

  abstract getConfig(): RemoteConfig

  abstract validate(): ValidateResult

  abstract selected(): void

  abstract test(callback: ErrorCallback): void

  abstract cancelTest(): void

}