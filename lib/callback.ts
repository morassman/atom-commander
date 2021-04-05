/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let Callback;
module.exports =
(Callback = class Callback {

  constructor(wrappedCallback) {
    this.wrappedCallback = wrappedCallback;
    this.cancelled = false;
  }

  cancel() {
    return this.cancelled = true;
  }

  callback(...args){
    if (!this.cancelled) {
      return this.wrappedCallback(args);
    }
  }
});
