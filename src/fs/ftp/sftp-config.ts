import { RemoteConfig } from './remote-config'

export interface SFTPConfig extends RemoteConfig {

  host: string

  port: number

  username: string

  password: string

  passphrase: string

  tryKeyboard: boolean

  keepaliveInterval: number
  
  privateKeyPath: string

}