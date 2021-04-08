export class Callback {

  cancelled: boolean

  constructor(public wrappedCallback: any) {
    this.cancelled = false;
  }

  cancel() {
    return this.cancelled = true
  }

  callback(...args: any[]) {
    if (!this.cancelled) {
      return this.wrappedCallback(args)
    }
  }

}
