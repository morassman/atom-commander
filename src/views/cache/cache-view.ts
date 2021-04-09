/*
 * decaffeinate suggestions:
 * DS002: Fix invalid constructor
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let CacheView;
const CacheItemView = require('./cache-item-view');
const {$, View} = require('atom-space-pen-views');
const {CompositeDisposable} = require('atom');

module.exports =
(CacheView = class CacheView extends View {

  constructor(server) {
    this.server = server;
    super(this.server);
  }

  static content() {
    return this.div({class: "atom-commander-sync"}, () => {
      this.div({class: "title-panel"}, () => {
        this.span({class: "title", outlet: "titlePanel"});
        return this.button("Refresh", {class: "button btn btn-sm", outlet: "refreshButton", click: "refresh"});
    });
      this.div({class: "table-panel"}, () => {
        return this.table(() => {
          return this.tbody({outlet: "tableBody", tabindex: -1});
      });
    });
      return this.div({class: "empty-panel", outlet: "emptyPanel"}, () => {
        return this.ul({class: "background-message centered"}, () => {
          return this.li("The cache is empty");
        });
      });
    });
  }

  getTitle() {
    return "Cache: " + this.server.getDisplayName();
  }

  getLocalFileSystem() {
    return this.server.getMain().getLocalFileSystem();
  }

  getTaskManager() {
    return this.fileSystem.getTaskManager();
  }

  initialize() {
    const name = this.server.getName();
    let title = this.server.getDescription();

    if (name.length > 0) {
      title = name + " : " + title;
    }

    this.syncItems = [];
    this.disposables = new CompositeDisposable();

    this.titlePanel.text("Local cache for "+title);
    this.refreshButton.on('mousedown', e => e.preventDefault());

    this.header = new CacheItemView();
    this.header.initializeHeader(this);
    this.jHeader = $(this.header);
    this.jHeader.addClass("table-header");
    this.tableBody[0].appendChild(this.header);

    this.fileSystem = this.server.getFileSystem().clone();
    this.disposables.add(this.fileSystem.getTaskManager().onEnd(err => this.taskManagerEnd(err)));
    return this.refresh();
  }

  taskManagerEnd(err) {
    if ((err == null)) {
      return;
    }

    let message = "Error.";

    if (err.message) {
      message += " "+err.message;
    }

    return (() => {
      const result = [];
      for (let syncItem of Array.from(this.syncItems)) {
        syncItem.showStatus(message, 2);
        result.push(syncItem.setTransferInProgress(false));
      }
      return result;
    })();
  }

  refresh() {
    for (let syncItem of Array.from(this.syncItems)) {
      syncItem.remove();
    }

    this.header.setChecked(false);

    this.syncItems = [];
    const cachePath = this.server.getCachePath();
    const filePaths = this.server.getCachedFilePaths();

    for (let filePath of Array.from(filePaths)) {
      const item = new CacheItemView();
      let remotePath = filePath.substring(cachePath.length);
      remotePath = remotePath.split("\\").join("/");
      item.initializeRow(this, filePath, remotePath);
      this.syncItems.push(item);
      this.tableBody[0].appendChild(item);
    }

    return this.refreshEmptyPanel();
  }

  setAllChecked(checked) {
    return Array.from(this.syncItems).map((syncItem) =>
      syncItem.setChecked(checked));
  }

  countChecked() {
    let result = 0;

    for (let syncItem of Array.from(this.syncItems)) {
      if (syncItem.isChecked()) {
        result++;
      }
    }

    return result;
  }

  uploadChecked() {
    return (() => {
      const result = [];
      for (let syncItem of Array.from(this.syncItems)) {
        if (syncItem.isChecked()) {
          result.push(syncItem.upload());
        } else {
          result.push(undefined);
        }
      }
      return result;
    })();
  }

  downloadChecked() {
    return (() => {
      const result = [];
      for (let syncItem of Array.from(this.syncItems)) {
        if (syncItem.isChecked()) {
          result.push(syncItem.download());
        } else {
          result.push(undefined);
        }
      }
      return result;
    })();
  }

  deleteChecked() {
    if (this.countChecked() === 0) {
      return;
    }

    const response = atom.confirm({
      message: 'Remove',
      detailedMessage: 'Remove the selected files from the cache?',
      buttons: ["No", "Yes"]});

    if (response === 0) {
      return;
    }

    return (() => {
      const result = [];
      for (let syncItem of Array.from(this.syncItems.slice())) {
        if (syncItem.isChecked()) {
          result.push(syncItem.delete());
        } else {
          result.push(undefined);
        }
      }
      return result;
    })();
  }

  removeItem(item) {
    item.remove();
    const index = this.syncItems.indexOf(item);

    if (index >= 0) {
      this.syncItems.splice(index, 1);
    }

    return this.refreshEmptyPanel();
  }

  refreshEmptyPanel() {
    if (this.syncItems.length === 0) {
      this.emptyPanel.show();
      return this.jHeader.hide();
    } else {
      this.emptyPanel.hide();
      return this.jHeader.show();
    }
  }

  destroy() {
    if (this.fileSystem != null) {
      this.fileSystem.disconnect();
    }
    return (this.disposables != null ? this.disposables.dispose() : undefined);
  }
});
