/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let StatusView;
const {View} = require('atom-space-pen-views');

module.exports =
(StatusView = class StatusView extends View {

  static content() {
    return this.div({class: "inline-block"}, () => {
      this.span("0", {class: "icon icon-cloud-download", outlet: "download"});
      return this.span("0", {class: "icon icon-cloud-upload", outlet: "upload"});
  });
  }

  initialize() {
    this.uploadCount = 0;
    this.downloadCount = 0;
    this.hide();
    this.upload.hide();
    return this.download.hide();
  }

  setUploadCount(uploadCount) {
    this.uploadCount = uploadCount;
    this.upload.text(this.uploadCount);
    return this.refreshVisible();
  }

  setDownloadCount(downloadCount) {
    this.downloadCount = downloadCount;
    this.download.text(this.downloadCount);
    return this.refreshVisible();
  }

  refreshVisible() {
    if ((this.uploadCount + this.downloadCount) === 0) {
      return this.hide();
    } else {
      if (this.uploadCount === 0) {
        this.upload.hide();
      } else {
        this.upload.show();
      }

      if (this.downloadCount === 0) {
        this.download.hide();
      } else {
        this.download.show();
      }
        
      return this.show();
    }
  }
});
