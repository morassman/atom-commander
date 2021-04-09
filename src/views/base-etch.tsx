// @ts-nocheck
/** @babel */
/** @jsx etch.dom */
 
const etch = require('etch')

export class BaseEtch {

  initialized = false

  element: any

  constructor(initialize=true) {
    if (initialize) {
      this.initialize()
    }
  }

  initialize() {
    if (!this.initialized) {
      this.initialized = true
      etch.initialize(this)
    }
  }

  render() {
    return <div/>
  }

  update(props: any, children: any) {
    if (this.initialized) {
      return etch.update(this)
    } else {
      return Promise.resolve()
    }
  }

}