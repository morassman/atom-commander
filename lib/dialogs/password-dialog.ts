/*
 * decaffeinate suggestions:
 * DS002: Fix invalid constructor
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let PasswordDialog;
const InputDialog = require('@aki77/atom-input-dialog');

module.exports =
(PasswordDialog = class PasswordDialog extends InputDialog {

  constructor(prompt, callback) {
    this.callback = callback;
    super({prompt});
  }

  initialize() {
    const options = {};

    options.callback = this.callback;
    options.validate = text => null;

    super.initialize(options);
    return this.miniEditor.addClass("atom-commander-password");
  }
});
