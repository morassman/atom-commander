const etch = require('etch')

import { ErrorCallback } from '../../fs'
import { SFTPConfig } from '../../fs/ftp/sftp-config'
import { ServerConfigProps, ServerConfigView, ValidateResult } from './server-config-view'

export class SFTPConfigView extends ServerConfigView<SFTPConfig> {
  
  constructor(props: ServerConfigProps) {
    super(props)
  }

  render() {
    return <div {...this.getProps()}>SFTP</div>
  }

  selected() {
  }

  validate(): ValidateResult {
    throw new Error('Method not implemented.')
  }

  setConfig(config: SFTPConfig): void {
    throw new Error('Method not implemented.')
  }

  getConfig(): SFTPConfig {
    throw new Error('Method not implemented.')
  }

  test(callback: ErrorCallback): void {
    throw new Error('Method not implemented.')
  }
  
  cancelTest(): void {
    throw new Error('Method not implemented.')
  }

}