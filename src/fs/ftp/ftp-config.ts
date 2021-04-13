import { RemoteConfig } from './remote-config'

export interface FTPConfig extends RemoteConfig {

  host: string

  port: number

  user: string

  password: string | null

  passwordDecrypted: boolean | null

  storePassword: boolean

  folder: string

}