import { RemoteConfig } from './remote-config'

export interface SFTPConfig extends RemoteConfig {

  host: string

  port: number

  username: string

  password?: string

  passphrase?: string

  folder: string

  tryKeyboard: boolean

  keepaliveInterval: number
  
  privateKeyPath: string

  privateKey?: string

  passwordDecrypted?: boolean

  loginWithPassword: boolean

  usePassphrase: boolean

  storePassword: boolean

}