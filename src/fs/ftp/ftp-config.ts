import { RemoteConfig } from './remote-config'

export interface FTPConfig extends RemoteConfig {

  host: string

  port: number

  user: string

  password?: string

  passwordDecrypted?: boolean

  storePassword: boolean

  folder: string

}