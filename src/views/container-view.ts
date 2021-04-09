/*
 * decaffeinate suggestions:
 * DS002: Fix invalid constructor
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let ContainerView;
const fs = require('fs-plus');
const minimatch = require('minimatch');
const Scheduler = require('nschedule');
const {filter} = require('fuzzaldrin');
const {View, TextEditorView} = require('atom-space-pen-views');
const {CompositeDisposable, Directory} = require('atom');
const FileController = require('../controllers/file-controller');
const DirectoryController = require('../controllers/directory-controller');
const SymLinkController = require('../controllers/symlink-controller');
const VFile = require('../fs/vfile');
const VDirectory = require('../fs/vdirectory');
const VSymLink = require('../fs/vsymlink');
const Utils = require('../utils');
const ListDirectoryView = require('./list-directory-view');
// HistoryView = require './history-view';

module.exports =
(ContainerView = class ContainerView extends View {

  constructor(left) {
    this.left = left;
    super();
    this.itemViews = [];
    this.directory = null;
    this.directoryDisposable = null;
    this.highlightedIndex = null;
    this.timeSearchStarted = null;
    this.timeKeyPressed = null;
    this.showSpinnerCount = 0;
    this.scheduler = new Scheduler(1);
    this.disposables = new CompositeDisposable();
    this.lastLocalPath = null;
    this.sortBy = null;
    this.sortAscending = true;

    this.directoryEditor.addClass('directory-editor');

    // @disposables.add(atom.tooltips.add(@history, {title: 'History'}));

    if (this.left) {
      this.username.addClass('left-username');
      // @history.addClass('left-history');
    } else {
      this.username.addClass('right-username');
    }
      // @history.addClass('right-history');

    this.username.hide();

    this.directoryEditor.blur(() => {
      return this.directoryEditorCancel();
    });

    this.disposables.add(atom.commands.add(this.directoryEditor[0], {
      'core:confirm': () => this.directoryEditorConfirm(),
      'core:cancel': () => this.directoryEditorCancel()
    }
    )
    );

    this.disposables.add(atom.commands.add(this.containerView[0], {
      'core:move-up': this.moveUp.bind(this),
      'core:move-down': this.moveDown.bind(this),
      'core:page-up': () => this.pageUp(),
      'core:page-down': () => this.pageDown(),
      'core:move-to-top': () => this.highlightFirstItem(),
      'core:move-to-bottom': () => this.highlightLastItem(),
      'core:cancel': () => this.escapePressed(),
      'atom-commander:open-highlighted-item': () => this.openHighlightedItem(false),
      'atom-commander:open-highlighted-item-native': () => this.openHighlightedItem(true),
      'atom-commander:open-parent-folder': () => this.backspacePressed(),
      'atom-commander:highlight-first-item': () => this.highlightFirstItem(),
      'atom-commander:highlight-last-item': () => this.highlightLastItem(),
      'atom-commander:page-up': () => this.pageUp(),
      'atom-commander:page-down': () => this.pageDown(),
      'atom-commander:select-item': () => this.spacePressed()
    }
    )
    );
  }

  static content() {
    return this.div({tabindex: -1, style: 'display: flex; flex-direction: column; flex: 1; overflow: auto'}, () => {
      this.div(() => {
        this.span('', {class: 'highlight-info username', outlet: 'username'});
        // @span '', {class: 'history icon icon-clock', outlet: 'history', click: 'toggleHistory' }
        return this.subview('directoryEditor', new TextEditorView({mini: true}));
      });
      this.div({class: 'atom-commander-container-view', outlet: 'containerView'}, () => {
        return this.container();
      });
      this.div({class: 'search-panel', outlet: 'searchPanel'});
      return this.div("Loading...", {class: 'loading-panel', outlet: 'spinnerPanel'});
  });
  }
      // @subview 'historyView', new HistoryView()

  isLeft() {
    return this.left;
  }

  setMainView(mainView) {
    this.mainView = mainView;
    return this.localFileSystem = this.mainView.getMain().getLocalFileSystem();
  }

  getMainView() {
    return this.mainView;
  }

  setTabView(tabView) {
    this.tabView = tabView;
    if (this.directory !== null) {
      return this.tabView.directoryChanged();
    }
  }

  getTabView() {
    return this.tabView;
  }

  getMain() {
    return this.mainView.getMain();
  }

  getDirectory() {
    return this.directory;
  }

  getFileSystem() {
    return this.directory.getFileSystem();
  }

  getLastLocalPath() {
    return this.lastLocalPath;
  }

  initialize(state) {
    this.searchPanel.hide();
    this.spinnerPanel.hide();

    // @historyView.set§(@);

    if (this.left) {
      this.addClass("left-container");
    }

    this.directoryEditor.addClass("directory-editor");
    this.directoryEditor.on('focus', e => {
      this.mainView.focusedView = this;
      // @historyView.close();
      this.mainView.getOtherView(this).refreshHighlight();
      return this.refreshHighlight();
    });

    this.on('dblclick', '.item', e => {
      this.requestFocus();
      this.highlightIndex(e.currentTarget.index, false);
      return this.openHighlightedItem();
    });

    this.on('mousedown', '.item', e => {
      this.requestFocus();
      return this.highlightIndex(e.currentTarget.index, false);
    });

    return this.keypress(e => this.handleKeyPress(e));
  }

  setHorizontal(horizontal) {
    this.username.removeClass('vertical-username');

    if (this.left) {
      this.username.removeClass('left-username');

      if (horizontal) {
        this.username.addClass('left-username');
      }
      // @history.addClass('left-history');
    } else {
      this.username.removeClass('right-username');

      if (horizontal) {
        this.username.addClass('right-username');
      }
    }
      // @history.addClass('right-history');

    if (!horizontal) {
      return this.username.addClass('vertical-username');
    }
  }

  toggleHistory(e) {
    return e.stopPropagation();
  }
    // @historyView.toggle();

  storeScrollTop() {
    return this.scrollTop = this.getScrollTop();
  }

  restoreScrollTop() {
    if (this.scrollTop != null) {
      return this.setScrollTop(this.scrollTop);
    }
  }

  getScrollTop() {}

  setScrollTop(scrollTop) {}

  cancelSpinner() {
    if (this.showSpinnerCount === 0) {
      return;
    }

    this.showSpinnerCount = 0;
    return this.spinnerPanel.hide();
  }

  showSpinner() {
    this.showSpinnerCount++;
    return this.spinnerPanel.show();
  }

  hideSpinner() {
    this.showSpinnerCount--;

    if (this.showSpinnerCount === 0) {
      return this.spinnerPanel.hide();
    }
  }

  escapePressed() {
    if (this.searchPanel.isVisible()) {
      return this.searchPanel.hide();
    }
  }

  backspacePressed() {
    if (this.searchPanel.isVisible()) {
      this.timeKeyPressed = Date.now();
      this.searchPanel.text(this.searchPanel.text().slice(0, -1));
      return this.search(this.searchPanel.text());
    } else {
      return this.openParentDirectory();
    }
  }

  spacePressed() {
    if (this.searchPanel.isVisible()) {
      this.timeKeyPressed = Date.now();
      this.searchPanel.text(this.searchPanel.text()+" ");
      return this.search(this.searchPanel.text());
    } else {
      return this.selectItem();
    }
  }

  handleKeyPress(e) {
    if (!this.hasContainerFocus()) {
      return;
    }

    // When Alt is down the menu is being shown.
    if (e.altKey) {
      return;
    }

    const charCode = e.which | e.keyCode;
    const sCode = String.fromCharCode(charCode);

    if (this.searchPanel.isHidden()) {
      if (sCode === "+") {
        this.mainView.main.actions.selectAdd();
        return;
      } else if (sCode === "-") {
        this.mainView.main.actions.selectRemove();
        return;
      } else if (sCode === "*") {
        this.mainView.main.actions.selectInvert();
        return;
      } else {
        this.showSearchPanel();
      }
    } else {
      this.timeKeyPressed = Date.now();
    }

    this.searchPanel.append(sCode);
    return this.search(this.searchPanel.text());
  }

  showSearchPanel() {
    this.timeSearchStarted = Date.now();
    this.timeKeyPressed = this.timeSearchStarted;
    this.searchPanel.text("");
    this.searchPanel.show();

    return this.scheduleTimer();
  }

  scheduleTimer() {
    return this.scheduler.add(1000, done => {
      const currentTime = Date.now();
      let hide = false;

      if (this.timeSearchStarted === this.timeKeyPressed) {
        hide = true;
      } else if ((currentTime - this.timeKeyPressed) >= 1000) {
        hide = true;
      }

      done(this.scheduler.STOP);

      if (hide) {
        return this.searchPanel.hide();
      } else {
        return this.scheduleTimer();
      }
    });
  }

  search(text) {
    const results = filter(this.itemViews, text, {key: 'itemName', maxResults: 1});
    if (results.length > 0) {
      return this.highlightIndexWithName(results[0].itemName);
    }
  }

  getPath() {
    if (this.directory === null) {
      return null;
    }

    return this.directory.getRealPathSync();
  }

  getURI() {
    if (this.directory === null) {
      return null;
    }

    return this.directory.getURI();
  }

  // includeHighlightIfEmpty : true if the highlighted name should be included if nothing is selected.
  getSelectedNames(includeHighlightIfEmpty?){
    let itemView;
    if (includeHighlightIfEmpty == null) { includeHighlightIfEmpty = false; }
    const paths = [];

    for (itemView of Array.from(this.itemViews)) {
      if (itemView.selected) {
        paths.push(itemView.getName());
      }
    }

    if (includeHighlightIfEmpty && (paths.length === 0) && (this.highlightedIndex !== null)) {
      itemView = this.itemViews[this.highlightedIndex];

      if (itemView.isSelectable()) {
        paths.push(itemView.getName());
      }
    }

    return paths;
  }

  getSelectedItemViews(includeHighlightIfEmpty) {
    let itemView;
    if (includeHighlightIfEmpty == null) { includeHighlightIfEmpty = false; }
    const paths = [];

    for (itemView of Array.from(this.itemViews)) {
      if (itemView.selected) {
        paths.push(itemView);
      }
    }

    if (includeHighlightIfEmpty && (paths.length === 0) && (this.highlightedIndex !== null)) {
      itemView = this.itemViews[this.highlightedIndex];

      if (itemView.isSelectable()) {
        paths.push(itemView);
      }
    }

    return paths;
  }

  getItemViewsWithPattern(pattern) {
    const result = [];

    for (let itemView of Array.from(this.itemViews)) {
      if (minimatch(itemView.getName(), pattern, { dot: true, nocase: true})) {
        result.push(itemView);
      }
    }

    return result;
  }

  requestFocus() {
    return this.mainView.focusView(this);
  }

  focus() {
    return this.refreshHighlight();
  }

  unfocus() {
    atom.workspace.getActivePane().activate();
    return this.refreshHighlight();
  }

  hasFocus() {
    return this.hasContainerFocus() || this.directoryEditor.hasFocus();
  }

  // Override and return whether the item container view has focus.
  hasContainerFocus() {}

  // Override to remove all item views.
  clearItemViews() {}

  // Override to create a new view for navigating to the parent directory.
  createParentView(index, directoryController) {}

  // Override to creates and return a new view for the given item.
  createFileView(index, fileController) {}

  createDirectoryView(index, directoryController) {}

  createSymLinkView(index, symLinkController) {}

  // Override to add the given item view.
  addItemView(itemView) {}

  // Override to adjust the height of the content.
  adjustContentHeight(change) {}

  // Override to return the height of the content.
  getContentHeight() {}

  // Override to set the height of the content.
  setContentHeight(contentHeight) {}

  // Override to refresh the sort icons.
  refreshSortIcons(sortBy, ascending) {}

  moveUp(event) {
    if (this.highlightedIndex !== null) {
      return this.highlightIndex(this.highlightedIndex-1);
    }
  }

  moveDown(event) {
    if (this.highlightedIndex !== null) {
      return this.highlightIndex(this.highlightedIndex+1);
    }
  }

  // Override
  pageUp() {}

  // Override
  pageDown() {}

  selectItem() {
    if (this.highlightedIndex === null) {
      return;
    }

    const itemView = this.itemViews[this.highlightedIndex];
    itemView.toggleSelect();

    return this.highlightIndex(this.highlightedIndex+1);
  }

  highlightFirstItem() {
    return this.highlightIndex(0);
  }

  highlightLastItem() {
    if (this.itemViews.length > 0) {
      return this.highlightIndex(this.itemViews.length - 1);
    }
  }

  highlightIndex(index, scroll?) {
    if (scroll == null) { scroll = true; }
    if (this.highlightedIndex !== null) {
      this.itemViews[this.highlightedIndex].highlight(false, this.hasFocus());
    }

    if (this.itemViews.length === 0) {
      index = null;
    } else if (index < 0) {
      index = 0;
    } else if (index >= this.itemViews.length) {
      index = this.itemViews.length - 1;
    }

    this.highlightedIndex = index;
    return this.refreshHighlight(scroll);
  }

  refreshHighlight(scroll?) {
    if (scroll == null) { scroll = false; }
    if (this.highlightedIndex !== null) {
      const focused = this.hasFocus();
      const itemView = this.itemViews[this.highlightedIndex];
      itemView.highlight(true, focused);

      if (focused && scroll) {
        return itemView.scrollIntoViewIfNeeded(true);
      }
    }
  }

  highlightIndexWithName(name) {
    const itemView = this.getItemViewWithName(name);

    if (itemView !== null) {
      return this.highlightIndex(itemView.index);
    }
  }

  getItemViewWithName(name) {
    for (let itemView of Array.from(this.itemViews)) {
      if (itemView.getName() === name) {
        return itemView;
      }
    }

    return null;
  }

  getHighlightedItem() {
    if (this.highlightedIndex === null) {
      return null;
    }

    return this.itemViews[this.highlightedIndex];
  }

  getHighlightedItemName() {
    if (this.highlightedIndex === null) {
      return null;
    }

    return this.itemViews[this.highlightedIndex].getName();
  }

  openHighlightedItem(isNative?){
    if (isNative == null) { isNative = false; }
    if (this.highlightedIndex === null) {
      return;
    }

    if (isNative) {
      return this.getMain().getActions().openSystem();
    } else {
      const itemView = this.itemViews[this.highlightedIndex];
      return itemView.performOpenAction();
    }
  }

  openLastLocalDirectory() {
    return this.openDirectory(this.getInitialDirectory(this.lastLocalPath));
  }

  openParentDirectory() {
    if (!this.directory.isRoot()) {
      const snapShot = {};
      snapShot.name = this.directory.getBaseName();
      return this.openDirectory(this.directory.getParent(), snapShot);
    }
  }

  openDirectory(directory, snapShot = null, callback = null) {
    if (this.searchPanel.isVisible()) {
      this.searchPanel.hide();
    }

    if (directory instanceof Directory) {
      directory = this.localFileSystem.getDirectory(directory.getRealPathSync());
    }

    // if (@directory != null) and @directory.getPath() == directory.getPath()
    //   return;

    try {
      return this.tryOpenDirectory(directory, snapShot, callback);
    } catch (error) {
      console.error(error);
      // If the directory couldn't be opened and one hasn't been opened yet then
      // revert to opening the home folder and finally the PWD.
      if ((this.directory === null) || !fs.isDirectorySync(this.directory.getRealPathSync())) {
        try {
          return this.tryOpenDirectory(this.localFileSystem.getDirectory(fs.getHomeDirectory()), null, callback);
        } catch (error2) {
          return this.tryOpenDirectory(this.localFileSystem.getDirectory(process.env['PWD']), null, callback);
        }
      }
    }
  }

  tryOpenDirectory(newDirectory, snapShot = null, callback = null) {
    this.directory = newDirectory;
    if (this.tabView != null) {
      this.tabView.directoryChanged();
    }
    this.cancelSpinner();
    this.disableAutoRefresh();

    this.resetItemViews();
    this.highlightIndex(0);

    this.getEntries(newDirectory, snapShot, callback);

    const fileSystem = this.directory.getFileSystem();

    if (fileSystem.isLocal()) {
      this.lastLocalPath = this.directory.getPath();
      this.username.text("");
      return this.username.hide();
    } else {
      const displayName = fileSystem.getDisplayName();
      let un = fileSystem.getUsername();

      if (displayName && (displayName.length > 0)) {
        un = displayName + "  -  " + un;
      }

      this.username.text(un);
      return this.username.show();
    }
  }

  resetItemViews() {
    this.clearItemViews();

    this.itemViews = [];
    this.highlightedIndex = null;

    this.directoryEditor.setText(this.directory.getURI());

    if (!this.directory.isRoot()) {
      const itemView = this.createParentView(0, new DirectoryController(this.directory.getParent()));
      this.itemViews.push(itemView);
      return this.addItemView(itemView);
    }
  }

  refreshItemViews() {
    return Array.from(this.itemViews).map((itemView) =>
      itemView.refresh());
  }

  getEntries(newDirectory, snapShot, callback) {
    this.showSpinner();
    return newDirectory.getEntries((newDirectory, err, entries) => {
      if (err === null) {
        this.entriesCallback(newDirectory, entries, snapShot, callback);
      } else if ((err.canceled == null)) {
        Utils.showErrorWarning("Error reading folder", null, err, null, false);
        if (typeof callback === 'function') {
          callback(err);
        }
      } else {
        this.openLastLocalDirectory();
      }
      return this.hideSpinner();
    });
  }

  entriesCallback(newDirectory, entries, snapShot, callback) {
    if ((this.directory !== null) && (this.directory.getURI() !== newDirectory.getURI())) {
      if (typeof callback === 'function') {
        callback(null);
      }
      return;
    }

    let highlightIndex = 0;

    if (this.highlightedIndex !== null) {
      highlightIndex = this.highlightedIndex;
    }

    this.resetItemViews();

    let index = this.itemViews.length;

    for (let entry of Array.from(entries)) {
      var itemView;
      if (entry instanceof VFile) {
        itemView = this.createFileView(index, new FileController(entry));
      } else if (entry instanceof VDirectory) {
        itemView = this.createDirectoryView(index, new DirectoryController(entry));
      } else if (entry instanceof VSymLink) {
        itemView = this.createSymLinkView(index, new SymLinkController(entry));
      } else {
        itemView = null;
      }

      if (itemView != null) {
        this.itemViews.push(itemView);
        // @addItemView(itemView);
        index++;
      }
    }

    if (this.itemViews.length > 0) {
      this.highlightIndex(highlightIndex);
    }

    this.restoreSnapShot(snapShot);
    this.enableAutoRefresh();
    this.sort(true);
    return (typeof callback === 'function' ? callback(null) : undefined);
  }

  disableAutoRefresh() {
    if (this.directoryDisposable !== null) {
      this.directoryDisposable.dispose();
      return this.directoryDisposable = null;
    }
  }

  enableAutoRefresh() {
    if (this.directoryDisposable !== null) {
      return;
    }

    try {
      return this.directoryDisposable = this.directory.onDidChange(() => {
        return this.refreshDirectory();
      });
    } catch (error) {}
  }

  selectNames(names) {
    return (() => {
      const result = [];
      for (let itemView of Array.from(this.itemViews)) {
        if (names.indexOf(itemView.getName()) > -1) {
          result.push(itemView.select(true));
        } else {
          result.push(undefined);
        }
      }
      return result;
    })();
  }

  getNames() {
    const names = [];

    for (let itemView of Array.from(this.itemViews)) {
      names.push(itemView.getName());
    }

    return names;
  }

  refreshDirectory() {
    return this.refreshDirectoryWithSnapShot(this.captureSnapShot());
  }

  refreshDirectoryWithSnapShot(snapShot) {
    return this.openDirectory(this.directory, snapShot);
  }

  captureSnapShot() {
    const snapShot = {};

    snapShot.index = this.highlightedIndex;
    snapShot.name = this.getHighlightedItemName();
    snapShot.selectedNames = this.getSelectedNames();

    return snapShot;
  }

  restoreSnapShot(snapShot) {
    if ((snapShot == null)) {
      return;
    }

    let {
      index
    } = snapShot;

    if (snapShot.name != null) {
      // If the item with the name still exists then highlight it, otherwise highlight the index.
      const itemView = this.getItemViewWithName(snapShot.name);

      if (itemView !== null) {
        ({
          index
        } = itemView);
      }
    }

    if (index != null) {
      this.highlightIndex(index);
    }

    if (snapShot.selectedNames != null) {
      return this.selectNames(snapShot.selectedNames);
    }
  }

  setDirectory(path) {
    if (!fs.isDirectorySync(path)) {
      return;
    }

    this.directoryEditor.setText(path);
    return this.directoryEditorConfirm();
  }

  directoryEditorConfirm() {
    const uri = this.directoryEditor.getText().trim();

    if (fs.isDirectorySync(uri)) {
      this.openDirectory(this.localFileSystem.getDirectory(uri), null, () => this.focus());
      return;
    } else if (fs.isFileSync(uri)) {
      const file = this.localFileSystem.getFile(uri);
      this.mainView.main.actions.goFile(file, true);
      return;
    }

    const fileSystem = this.directory.getFileSystem();

    if (fileSystem.isLocal()) {
      return;
    }

    const path = fileSystem.getPathFromURI(uri);

    if (path !== null) {
      return this.openDirectory(fileSystem.getDirectory(path), null, () => this.focus());
    }
  }

    // # TODO : The file system may change.
    // directory = @directory.fileSystem.getDirectory(@directoryEditor.getText().trim());
    //
    // if directory.existsSync() and directory.isDirectory()
    //   @openDirectory(directory);

  directoryEditorCancel() {
    return this.directoryEditor.setText(this.directory.getURI());
  }

  addProject() {
    return this.addRemoveProject(true);
  }

  removeProject() {
    return this.addRemoveProject(false);
  }

  addRemoveProject(add) {
    if (this.directory === null) {
      return;
    }

    if (!this.directory.fileSystem.isLocal()) {
      atom.notifications.addWarning("Remote project folders are not yet supported.");
      return;
    }

    const selectedItemViews = this.getSelectedItemViews(true);
    const directories = [];

    for (let selectedItemView of Array.from(selectedItemViews)) {
      if (selectedItemView.isSelectable() && (selectedItemView.itemController instanceof DirectoryController)) {
        directories.push(selectedItemView.itemController.getDirectory());
      }
    }

    if (directories.length === 0) {
      if (add) {
        return atom.project.addPath(this.directory.getPath());
      } else {
        return atom.project.removePath(this.directory.getPath());
      }
    } else {
      return Array.from(directories).map((directory) =>
        add ?
          atom.project.addPath(directory.getPath())
        :
          atom.project.removePath(directory.getPath()));
    }
  }

  selectAll() {
    return (() => {
      const result = [];
      for (let itemView of Array.from(this.itemViews)) {
        if (itemView.isSelectable()) {
          result.push(itemView.select(true));
        } else {
          result.push(undefined);
        }
      }
      return result;
    })();
  }

  selectNone() {
    return (() => {
      const result = [];
      for (let itemView of Array.from(this.itemViews)) {
        if (itemView.isSelectable()) {
          result.push(itemView.select(false));
        } else {
          result.push(undefined);
        }
      }
      return result;
    })();
  }

  selectInvert() {
    return (() => {
      const result = [];
      for (let itemView of Array.from(this.itemViews)) {
        if (itemView.isSelectable()) {
          result.push(itemView.toggleSelect());
        } else {
          result.push(undefined);
        }
      }
      return result;
    })();
  }

  getInitialDirectory(suggestedPath) {
    if ((suggestedPath != null) && fs.isDirectorySync(suggestedPath)) {
      return this.localFileSystem.getDirectory(suggestedPath);
    }

    const directories = atom.project.getDirectories();

    if (directories.length > 0) {
      return this.localFileSystem.getDirectory(directories[0].getRealPathSync());
    }

    return this.localFileSystem.getDirectory(fs.getHomeDirectory());
  }

  fileSystemRemoved(fileSystem) {
    if (this.directory.getFileSystem() === fileSystem) {
      return this.openDirectory(this.getInitialDirectory(this.lastLocalPath));
    }
  }

  serverClosed(server) {
    if (this.directory.getFileSystem() === server.getFileSystem()) {
      return this.openDirectory(this.getInitialDirectory(this.lastLocalPath));
    }
  }

  isSizeColumnVisible() {
    return this.getMainView().isSizeColumnVisible();
  }

  isDateColumnVisible() {
    return this.getMainView().isDateColumnVisible();
  }

  isExtensionColumnVisible() {
    return this.getMainView().isExtensionColumnVisible();
  }

  setSizeColumnVisible(visible) {}

  setDateColumnVisible(visible) {}

  setExtensionColumnVisible(visible) {}

  setSortBy(sortBy) {
    if (this.sortBy === sortBy) {
      if (sortBy === null) {
        return;
      }
      this.sortAscending = !this.sortAscending;
    } else {
      this.sortBy = sortBy;
      this.sortAscending = true;
    }

    if (sortBy === null) {
      return this.refreshDirectory();
    } else {
      return this.sort(true);
    }
  }

  sort(scrollToHighlight) {
    let itemView;
    if (scrollToHighlight == null) { scrollToHighlight = false; }
    if (this.itemViews.length === 0) {
      return;
    }

    const prevHighlightIndex = this.highlightedIndex;
    this.highlightIndex(null, false);
    this.clearItemViews();

    // Separate files and directories.
    let parentItemView = null;
    const dirItemViews = [];
    const fileItemViews = [];

    for (itemView of Array.from(this.itemViews)) {
      const item = itemView.getItem();

      if (item.isFile()) {
        fileItemViews.push(itemView);
      } else if (item.isDirectory()) {
        if (itemView.isForParentDirectory()) {
          parentItemView = itemView;
        } else {
          dirItemViews.push(itemView);
        }
      }
    }

    Utils.sortItemViews(true, dirItemViews, this.sortBy, this.sortAscending);
    Utils.sortItemViews(false, fileItemViews, this.sortBy, this.sortAscending);

    this.itemViews = [];

    if (parentItemView != null) {
      this.itemViews.push(parentItemView);
    }

    this.itemViews = this.itemViews.concat(dirItemViews);
    this.itemViews = this.itemViews.concat(fileItemViews);

    let index = 0;
    let newHighlightIndex = null;

    for (itemView of Array.from(this.itemViews)) {
      if ((newHighlightIndex == null) && (itemView.index === prevHighlightIndex)) {
        newHighlightIndex = index;
      }
      itemView.index = index++;
      this.addItemView(itemView);
    }

    this.highlightIndex(newHighlightIndex, scrollToHighlight);
    return this.refreshSortIcons(this.sortBy, this.sortAscending);
  }

  deserialize(path, state) {
    if ((state == null)) {
      this.openDirectory(this.getInitialDirectory(path));
      return;
    }

    this.sortBy = state.sortBy;
    this.sortAscending = state.sortAscending;

    if ((this.sortBy == null)) {
      this.sortBy = null;
    }

    if ((this.sortAscending == null)) {
      this.sortAscending = true;
    }

    const snapShot = {};
    snapShot.name = state.highlight;
    return this.openDirectory(this.getInitialDirectory(state.path), snapShot);
  }

    // if state.highlight?
    //   @highlightIndexWithName(state.highlight);

  serialize() {
    const state = {};
    state.sortBy = this.sortBy;
    state.sortAscending = this.sortAscending;

    if (this.directory.isLocal()) {
      state.path = this.getPath();
      state.highlight = this.getHighlightedItemName();
    } else {
      state.path = this.lastLocalPath;
    }

    return state;
  }

  dispose() {
    return this.disposables.dispose();
  }
});
