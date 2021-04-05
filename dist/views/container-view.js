var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/*
 * decaffeinate suggestions:
 * DS002: Fix invalid constructor
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var ContainerView;
var fs = require('fs-plus');
var minimatch = require('minimatch');
var Scheduler = require('nschedule');
var filter = require('fuzzaldrin').filter;
var _a = require('atom-space-pen-views'), View = _a.View, TextEditorView = _a.TextEditorView;
var _b = require('atom'), CompositeDisposable = _b.CompositeDisposable, Directory = _b.Directory;
var FileController = require('../controllers/file-controller');
var DirectoryController = require('../controllers/directory-controller');
var SymLinkController = require('../controllers/symlink-controller');
var VFile = require('../fs/vfile');
var VDirectory = require('../fs/vdirectory');
var VSymLink = require('../fs/vsymlink');
var Utils = require('../utils');
var ListDirectoryView = require('./list-directory-view');
// HistoryView = require './history-view';
module.exports =
    (ContainerView = /** @class */ (function (_super) {
        __extends(ContainerView, _super);
        function ContainerView(left) {
            var _this = this;
            _this.left = left;
            _this = _super.call(this) || this;
            _this.itemViews = [];
            _this.directory = null;
            _this.directoryDisposable = null;
            _this.highlightedIndex = null;
            _this.timeSearchStarted = null;
            _this.timeKeyPressed = null;
            _this.showSpinnerCount = 0;
            _this.scheduler = new Scheduler(1);
            _this.disposables = new CompositeDisposable();
            _this.lastLocalPath = null;
            _this.sortBy = null;
            _this.sortAscending = true;
            _this.directoryEditor.addClass('directory-editor');
            // @disposables.add(atom.tooltips.add(@history, {title: 'History'}));
            if (_this.left) {
                _this.username.addClass('left-username');
                // @history.addClass('left-history');
            }
            else {
                _this.username.addClass('right-username');
            }
            // @history.addClass('right-history');
            _this.username.hide();
            _this.directoryEditor.blur(function () {
                return _this.directoryEditorCancel();
            });
            _this.disposables.add(atom.commands.add(_this.directoryEditor[0], {
                'core:confirm': function () { return _this.directoryEditorConfirm(); },
                'core:cancel': function () { return _this.directoryEditorCancel(); }
            }));
            _this.disposables.add(atom.commands.add(_this.containerView[0], {
                'core:move-up': _this.moveUp.bind(_this),
                'core:move-down': _this.moveDown.bind(_this),
                'core:page-up': function () { return _this.pageUp(); },
                'core:page-down': function () { return _this.pageDown(); },
                'core:move-to-top': function () { return _this.highlightFirstItem(); },
                'core:move-to-bottom': function () { return _this.highlightLastItem(); },
                'core:cancel': function () { return _this.escapePressed(); },
                'atom-commander:open-highlighted-item': function () { return _this.openHighlightedItem(false); },
                'atom-commander:open-highlighted-item-native': function () { return _this.openHighlightedItem(true); },
                'atom-commander:open-parent-folder': function () { return _this.backspacePressed(); },
                'atom-commander:highlight-first-item': function () { return _this.highlightFirstItem(); },
                'atom-commander:highlight-last-item': function () { return _this.highlightLastItem(); },
                'atom-commander:page-up': function () { return _this.pageUp(); },
                'atom-commander:page-down': function () { return _this.pageDown(); },
                'atom-commander:select-item': function () { return _this.spacePressed(); }
            }));
            return _this;
        }
        ContainerView.content = function () {
            var _this = this;
            return this.div({ tabindex: -1, style: 'display: flex; flex-direction: column; flex: 1; overflow: auto' }, function () {
                _this.div(function () {
                    _this.span('', { "class": 'highlight-info username', outlet: 'username' });
                    // @span '', {class: 'history icon icon-clock', outlet: 'history', click: 'toggleHistory' }
                    return _this.subview('directoryEditor', new TextEditorView({ mini: true }));
                });
                _this.div({ "class": 'atom-commander-container-view', outlet: 'containerView' }, function () {
                    return _this.container();
                });
                _this.div({ "class": 'search-panel', outlet: 'searchPanel' });
                return _this.div("Loading...", { "class": 'loading-panel', outlet: 'spinnerPanel' });
            });
        };
        // @subview 'historyView', new HistoryView()
        ContainerView.prototype.isLeft = function () {
            return this.left;
        };
        ContainerView.prototype.setMainView = function (mainView) {
            this.mainView = mainView;
            return this.localFileSystem = this.mainView.getMain().getLocalFileSystem();
        };
        ContainerView.prototype.getMainView = function () {
            return this.mainView;
        };
        ContainerView.prototype.setTabView = function (tabView) {
            this.tabView = tabView;
            if (this.directory !== null) {
                return this.tabView.directoryChanged();
            }
        };
        ContainerView.prototype.getTabView = function () {
            return this.tabView;
        };
        ContainerView.prototype.getMain = function () {
            return this.mainView.getMain();
        };
        ContainerView.prototype.getDirectory = function () {
            return this.directory;
        };
        ContainerView.prototype.getFileSystem = function () {
            return this.directory.getFileSystem();
        };
        ContainerView.prototype.getLastLocalPath = function () {
            return this.lastLocalPath;
        };
        ContainerView.prototype.initialize = function (state) {
            var _this = this;
            this.searchPanel.hide();
            this.spinnerPanel.hide();
            // @historyView.set§(@);
            if (this.left) {
                this.addClass("left-container");
            }
            this.directoryEditor.addClass("directory-editor");
            this.directoryEditor.on('focus', function (e) {
                _this.mainView.focusedView = _this;
                // @historyView.close();
                _this.mainView.getOtherView(_this).refreshHighlight();
                return _this.refreshHighlight();
            });
            this.on('dblclick', '.item', function (e) {
                _this.requestFocus();
                _this.highlightIndex(e.currentTarget.index, false);
                return _this.openHighlightedItem();
            });
            this.on('mousedown', '.item', function (e) {
                _this.requestFocus();
                return _this.highlightIndex(e.currentTarget.index, false);
            });
            return this.keypress(function (e) { return _this.handleKeyPress(e); });
        };
        ContainerView.prototype.setHorizontal = function (horizontal) {
            this.username.removeClass('vertical-username');
            if (this.left) {
                this.username.removeClass('left-username');
                if (horizontal) {
                    this.username.addClass('left-username');
                }
                // @history.addClass('left-history');
            }
            else {
                this.username.removeClass('right-username');
                if (horizontal) {
                    this.username.addClass('right-username');
                }
            }
            // @history.addClass('right-history');
            if (!horizontal) {
                return this.username.addClass('vertical-username');
            }
        };
        ContainerView.prototype.toggleHistory = function (e) {
            return e.stopPropagation();
        };
        // @historyView.toggle();
        ContainerView.prototype.storeScrollTop = function () {
            return this.scrollTop = this.getScrollTop();
        };
        ContainerView.prototype.restoreScrollTop = function () {
            if (this.scrollTop != null) {
                return this.setScrollTop(this.scrollTop);
            }
        };
        ContainerView.prototype.getScrollTop = function () { };
        ContainerView.prototype.setScrollTop = function (scrollTop) { };
        ContainerView.prototype.cancelSpinner = function () {
            if (this.showSpinnerCount === 0) {
                return;
            }
            this.showSpinnerCount = 0;
            return this.spinnerPanel.hide();
        };
        ContainerView.prototype.showSpinner = function () {
            this.showSpinnerCount++;
            return this.spinnerPanel.show();
        };
        ContainerView.prototype.hideSpinner = function () {
            this.showSpinnerCount--;
            if (this.showSpinnerCount === 0) {
                return this.spinnerPanel.hide();
            }
        };
        ContainerView.prototype.escapePressed = function () {
            if (this.searchPanel.isVisible()) {
                return this.searchPanel.hide();
            }
        };
        ContainerView.prototype.backspacePressed = function () {
            if (this.searchPanel.isVisible()) {
                this.timeKeyPressed = Date.now();
                this.searchPanel.text(this.searchPanel.text().slice(0, -1));
                return this.search(this.searchPanel.text());
            }
            else {
                return this.openParentDirectory();
            }
        };
        ContainerView.prototype.spacePressed = function () {
            if (this.searchPanel.isVisible()) {
                this.timeKeyPressed = Date.now();
                this.searchPanel.text(this.searchPanel.text() + " ");
                return this.search(this.searchPanel.text());
            }
            else {
                return this.selectItem();
            }
        };
        ContainerView.prototype.handleKeyPress = function (e) {
            if (!this.hasContainerFocus()) {
                return;
            }
            // When Alt is down the menu is being shown.
            if (e.altKey) {
                return;
            }
            var charCode = e.which | e.keyCode;
            var sCode = String.fromCharCode(charCode);
            if (this.searchPanel.isHidden()) {
                if (sCode === "+") {
                    this.mainView.main.actions.selectAdd();
                    return;
                }
                else if (sCode === "-") {
                    this.mainView.main.actions.selectRemove();
                    return;
                }
                else if (sCode === "*") {
                    this.mainView.main.actions.selectInvert();
                    return;
                }
                else {
                    this.showSearchPanel();
                }
            }
            else {
                this.timeKeyPressed = Date.now();
            }
            this.searchPanel.append(sCode);
            return this.search(this.searchPanel.text());
        };
        ContainerView.prototype.showSearchPanel = function () {
            this.timeSearchStarted = Date.now();
            this.timeKeyPressed = this.timeSearchStarted;
            this.searchPanel.text("");
            this.searchPanel.show();
            return this.scheduleTimer();
        };
        ContainerView.prototype.scheduleTimer = function () {
            var _this = this;
            return this.scheduler.add(1000, function (done) {
                var currentTime = Date.now();
                var hide = false;
                if (_this.timeSearchStarted === _this.timeKeyPressed) {
                    hide = true;
                }
                else if ((currentTime - _this.timeKeyPressed) >= 1000) {
                    hide = true;
                }
                done(_this.scheduler.STOP);
                if (hide) {
                    return _this.searchPanel.hide();
                }
                else {
                    return _this.scheduleTimer();
                }
            });
        };
        ContainerView.prototype.search = function (text) {
            var results = filter(this.itemViews, text, { key: 'itemName', maxResults: 1 });
            if (results.length > 0) {
                return this.highlightIndexWithName(results[0].itemName);
            }
        };
        ContainerView.prototype.getPath = function () {
            if (this.directory === null) {
                return null;
            }
            return this.directory.getRealPathSync();
        };
        ContainerView.prototype.getURI = function () {
            if (this.directory === null) {
                return null;
            }
            return this.directory.getURI();
        };
        // includeHighlightIfEmpty : true if the highlighted name should be included if nothing is selected.
        ContainerView.prototype.getSelectedNames = function (includeHighlightIfEmpty) {
            var itemView;
            if (includeHighlightIfEmpty == null) {
                includeHighlightIfEmpty = false;
            }
            var paths = [];
            for (var _i = 0, _a = Array.from(this.itemViews); _i < _a.length; _i++) {
                itemView = _a[_i];
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
        };
        ContainerView.prototype.getSelectedItemViews = function (includeHighlightIfEmpty) {
            var itemView;
            if (includeHighlightIfEmpty == null) {
                includeHighlightIfEmpty = false;
            }
            var paths = [];
            for (var _i = 0, _a = Array.from(this.itemViews); _i < _a.length; _i++) {
                itemView = _a[_i];
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
        };
        ContainerView.prototype.getItemViewsWithPattern = function (pattern) {
            var result = [];
            for (var _i = 0, _a = Array.from(this.itemViews); _i < _a.length; _i++) {
                var itemView = _a[_i];
                if (minimatch(itemView.getName(), pattern, { dot: true, nocase: true })) {
                    result.push(itemView);
                }
            }
            return result;
        };
        ContainerView.prototype.requestFocus = function () {
            return this.mainView.focusView(this);
        };
        ContainerView.prototype.focus = function () {
            return this.refreshHighlight();
        };
        ContainerView.prototype.unfocus = function () {
            atom.workspace.getActivePane().activate();
            return this.refreshHighlight();
        };
        ContainerView.prototype.hasFocus = function () {
            return this.hasContainerFocus() || this.directoryEditor.hasFocus();
        };
        // Override and return whether the item container view has focus.
        ContainerView.prototype.hasContainerFocus = function () { };
        // Override to remove all item views.
        ContainerView.prototype.clearItemViews = function () { };
        // Override to create a new view for navigating to the parent directory.
        ContainerView.prototype.createParentView = function (index, directoryController) { };
        // Override to creates and return a new view for the given item.
        ContainerView.prototype.createFileView = function (index, fileController) { };
        ContainerView.prototype.createDirectoryView = function (index, directoryController) { };
        ContainerView.prototype.createSymLinkView = function (index, symLinkController) { };
        // Override to add the given item view.
        ContainerView.prototype.addItemView = function (itemView) { };
        // Override to adjust the height of the content.
        ContainerView.prototype.adjustContentHeight = function (change) { };
        // Override to return the height of the content.
        ContainerView.prototype.getContentHeight = function () { };
        // Override to set the height of the content.
        ContainerView.prototype.setContentHeight = function (contentHeight) { };
        // Override to refresh the sort icons.
        ContainerView.prototype.refreshSortIcons = function (sortBy, ascending) { };
        ContainerView.prototype.moveUp = function (event) {
            if (this.highlightedIndex !== null) {
                return this.highlightIndex(this.highlightedIndex - 1);
            }
        };
        ContainerView.prototype.moveDown = function (event) {
            if (this.highlightedIndex !== null) {
                return this.highlightIndex(this.highlightedIndex + 1);
            }
        };
        // Override
        ContainerView.prototype.pageUp = function () { };
        // Override
        ContainerView.prototype.pageDown = function () { };
        ContainerView.prototype.selectItem = function () {
            if (this.highlightedIndex === null) {
                return;
            }
            var itemView = this.itemViews[this.highlightedIndex];
            itemView.toggleSelect();
            return this.highlightIndex(this.highlightedIndex + 1);
        };
        ContainerView.prototype.highlightFirstItem = function () {
            return this.highlightIndex(0);
        };
        ContainerView.prototype.highlightLastItem = function () {
            if (this.itemViews.length > 0) {
                return this.highlightIndex(this.itemViews.length - 1);
            }
        };
        ContainerView.prototype.highlightIndex = function (index, scroll) {
            if (scroll == null) {
                scroll = true;
            }
            if (this.highlightedIndex !== null) {
                this.itemViews[this.highlightedIndex].highlight(false, this.hasFocus());
            }
            if (this.itemViews.length === 0) {
                index = null;
            }
            else if (index < 0) {
                index = 0;
            }
            else if (index >= this.itemViews.length) {
                index = this.itemViews.length - 1;
            }
            this.highlightedIndex = index;
            return this.refreshHighlight(scroll);
        };
        ContainerView.prototype.refreshHighlight = function (scroll) {
            if (scroll == null) {
                scroll = false;
            }
            if (this.highlightedIndex !== null) {
                var focused = this.hasFocus();
                var itemView = this.itemViews[this.highlightedIndex];
                itemView.highlight(true, focused);
                if (focused && scroll) {
                    return itemView.scrollIntoViewIfNeeded(true);
                }
            }
        };
        ContainerView.prototype.highlightIndexWithName = function (name) {
            var itemView = this.getItemViewWithName(name);
            if (itemView !== null) {
                return this.highlightIndex(itemView.index);
            }
        };
        ContainerView.prototype.getItemViewWithName = function (name) {
            for (var _i = 0, _a = Array.from(this.itemViews); _i < _a.length; _i++) {
                var itemView = _a[_i];
                if (itemView.getName() === name) {
                    return itemView;
                }
            }
            return null;
        };
        ContainerView.prototype.getHighlightedItem = function () {
            if (this.highlightedIndex === null) {
                return null;
            }
            return this.itemViews[this.highlightedIndex];
        };
        ContainerView.prototype.getHighlightedItemName = function () {
            if (this.highlightedIndex === null) {
                return null;
            }
            return this.itemViews[this.highlightedIndex].getName();
        };
        ContainerView.prototype.openHighlightedItem = function (isNative) {
            if (isNative == null) {
                isNative = false;
            }
            if (this.highlightedIndex === null) {
                return;
            }
            if (isNative) {
                return this.getMain().getActions().openSystem();
            }
            else {
                var itemView = this.itemViews[this.highlightedIndex];
                return itemView.performOpenAction();
            }
        };
        ContainerView.prototype.openLastLocalDirectory = function () {
            return this.openDirectory(this.getInitialDirectory(this.lastLocalPath));
        };
        ContainerView.prototype.openParentDirectory = function () {
            if (!this.directory.isRoot()) {
                var snapShot = {};
                snapShot.name = this.directory.getBaseName();
                return this.openDirectory(this.directory.getParent(), snapShot);
            }
        };
        ContainerView.prototype.openDirectory = function (directory, snapShot, callback) {
            if (snapShot === void 0) { snapShot = null; }
            if (callback === void 0) { callback = null; }
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
            }
            catch (error) {
                console.error(error);
                // If the directory couldn't be opened and one hasn't been opened yet then
                // revert to opening the home folder and finally the PWD.
                if ((this.directory === null) || !fs.isDirectorySync(this.directory.getRealPathSync())) {
                    try {
                        return this.tryOpenDirectory(this.localFileSystem.getDirectory(fs.getHomeDirectory()), null, callback);
                    }
                    catch (error2) {
                        return this.tryOpenDirectory(this.localFileSystem.getDirectory(process.env['PWD']), null, callback);
                    }
                }
            }
        };
        ContainerView.prototype.tryOpenDirectory = function (newDirectory, snapShot, callback) {
            if (snapShot === void 0) { snapShot = null; }
            if (callback === void 0) { callback = null; }
            this.directory = newDirectory;
            if (this.tabView != null) {
                this.tabView.directoryChanged();
            }
            this.cancelSpinner();
            this.disableAutoRefresh();
            this.resetItemViews();
            this.highlightIndex(0);
            this.getEntries(newDirectory, snapShot, callback);
            var fileSystem = this.directory.getFileSystem();
            if (fileSystem.isLocal()) {
                this.lastLocalPath = this.directory.getPath();
                this.username.text("");
                return this.username.hide();
            }
            else {
                var displayName = fileSystem.getDisplayName();
                var un = fileSystem.getUsername();
                if (displayName && (displayName.length > 0)) {
                    un = displayName + "  -  " + un;
                }
                this.username.text(un);
                return this.username.show();
            }
        };
        ContainerView.prototype.resetItemViews = function () {
            this.clearItemViews();
            this.itemViews = [];
            this.highlightedIndex = null;
            this.directoryEditor.setText(this.directory.getURI());
            if (!this.directory.isRoot()) {
                var itemView = this.createParentView(0, new DirectoryController(this.directory.getParent()));
                this.itemViews.push(itemView);
                return this.addItemView(itemView);
            }
        };
        ContainerView.prototype.refreshItemViews = function () {
            return Array.from(this.itemViews).map(function (itemView) {
                return itemView.refresh();
            });
        };
        ContainerView.prototype.getEntries = function (newDirectory, snapShot, callback) {
            var _this = this;
            this.showSpinner();
            return newDirectory.getEntries(function (newDirectory, err, entries) {
                if (err === null) {
                    _this.entriesCallback(newDirectory, entries, snapShot, callback);
                }
                else if ((err.canceled == null)) {
                    Utils.showErrorWarning("Error reading folder", null, err, null, false);
                    if (typeof callback === 'function') {
                        callback(err);
                    }
                }
                else {
                    _this.openLastLocalDirectory();
                }
                return _this.hideSpinner();
            });
        };
        ContainerView.prototype.entriesCallback = function (newDirectory, entries, snapShot, callback) {
            if ((this.directory !== null) && (this.directory.getURI() !== newDirectory.getURI())) {
                if (typeof callback === 'function') {
                    callback(null);
                }
                return;
            }
            var highlightIndex = 0;
            if (this.highlightedIndex !== null) {
                highlightIndex = this.highlightedIndex;
            }
            this.resetItemViews();
            var index = this.itemViews.length;
            for (var _i = 0, _a = Array.from(entries); _i < _a.length; _i++) {
                var entry = _a[_i];
                var itemView;
                if (entry instanceof VFile) {
                    itemView = this.createFileView(index, new FileController(entry));
                }
                else if (entry instanceof VDirectory) {
                    itemView = this.createDirectoryView(index, new DirectoryController(entry));
                }
                else if (entry instanceof VSymLink) {
                    itemView = this.createSymLinkView(index, new SymLinkController(entry));
                }
                else {
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
        };
        ContainerView.prototype.disableAutoRefresh = function () {
            if (this.directoryDisposable !== null) {
                this.directoryDisposable.dispose();
                return this.directoryDisposable = null;
            }
        };
        ContainerView.prototype.enableAutoRefresh = function () {
            var _this = this;
            if (this.directoryDisposable !== null) {
                return;
            }
            try {
                return this.directoryDisposable = this.directory.onDidChange(function () {
                    return _this.refreshDirectory();
                });
            }
            catch (error) { }
        };
        ContainerView.prototype.selectNames = function (names) {
            var _this = this;
            return (function () {
                var result = [];
                for (var _i = 0, _a = Array.from(_this.itemViews); _i < _a.length; _i++) {
                    var itemView = _a[_i];
                    if (names.indexOf(itemView.getName()) > -1) {
                        result.push(itemView.select(true));
                    }
                    else {
                        result.push(undefined);
                    }
                }
                return result;
            })();
        };
        ContainerView.prototype.getNames = function () {
            var names = [];
            for (var _i = 0, _a = Array.from(this.itemViews); _i < _a.length; _i++) {
                var itemView = _a[_i];
                names.push(itemView.getName());
            }
            return names;
        };
        ContainerView.prototype.refreshDirectory = function () {
            return this.refreshDirectoryWithSnapShot(this.captureSnapShot());
        };
        ContainerView.prototype.refreshDirectoryWithSnapShot = function (snapShot) {
            return this.openDirectory(this.directory, snapShot);
        };
        ContainerView.prototype.captureSnapShot = function () {
            var snapShot = {};
            snapShot.index = this.highlightedIndex;
            snapShot.name = this.getHighlightedItemName();
            snapShot.selectedNames = this.getSelectedNames();
            return snapShot;
        };
        ContainerView.prototype.restoreSnapShot = function (snapShot) {
            if ((snapShot == null)) {
                return;
            }
            var index = snapShot.index;
            if (snapShot.name != null) {
                // If the item with the name still exists then highlight it, otherwise highlight the index.
                var itemView = this.getItemViewWithName(snapShot.name);
                if (itemView !== null) {
                    (index = itemView.index);
                }
            }
            if (index != null) {
                this.highlightIndex(index);
            }
            if (snapShot.selectedNames != null) {
                return this.selectNames(snapShot.selectedNames);
            }
        };
        ContainerView.prototype.setDirectory = function (path) {
            if (!fs.isDirectorySync(path)) {
                return;
            }
            this.directoryEditor.setText(path);
            return this.directoryEditorConfirm();
        };
        ContainerView.prototype.directoryEditorConfirm = function () {
            var _this = this;
            var uri = this.directoryEditor.getText().trim();
            if (fs.isDirectorySync(uri)) {
                this.openDirectory(this.localFileSystem.getDirectory(uri), null, function () { return _this.focus(); });
                return;
            }
            else if (fs.isFileSync(uri)) {
                var file = this.localFileSystem.getFile(uri);
                this.mainView.main.actions.goFile(file, true);
                return;
            }
            var fileSystem = this.directory.getFileSystem();
            if (fileSystem.isLocal()) {
                return;
            }
            var path = fileSystem.getPathFromURI(uri);
            if (path !== null) {
                return this.openDirectory(fileSystem.getDirectory(path), null, function () { return _this.focus(); });
            }
        };
        // # TODO : The file system may change.
        // directory = @directory.fileSystem.getDirectory(@directoryEditor.getText().trim());
        //
        // if directory.existsSync() and directory.isDirectory()
        //   @openDirectory(directory);
        ContainerView.prototype.directoryEditorCancel = function () {
            return this.directoryEditor.setText(this.directory.getURI());
        };
        ContainerView.prototype.addProject = function () {
            return this.addRemoveProject(true);
        };
        ContainerView.prototype.removeProject = function () {
            return this.addRemoveProject(false);
        };
        ContainerView.prototype.addRemoveProject = function (add) {
            if (this.directory === null) {
                return;
            }
            if (!this.directory.fileSystem.isLocal()) {
                atom.notifications.addWarning("Remote project folders are not yet supported.");
                return;
            }
            var selectedItemViews = this.getSelectedItemViews(true);
            var directories = [];
            for (var _i = 0, _a = Array.from(selectedItemViews); _i < _a.length; _i++) {
                var selectedItemView = _a[_i];
                if (selectedItemView.isSelectable() && (selectedItemView.itemController instanceof DirectoryController)) {
                    directories.push(selectedItemView.itemController.getDirectory());
                }
            }
            if (directories.length === 0) {
                if (add) {
                    return atom.project.addPath(this.directory.getPath());
                }
                else {
                    return atom.project.removePath(this.directory.getPath());
                }
            }
            else {
                return Array.from(directories).map(function (directory) {
                    return add ?
                        atom.project.addPath(directory.getPath())
                        :
                            atom.project.removePath(directory.getPath());
                });
            }
        };
        ContainerView.prototype.selectAll = function () {
            var _this = this;
            return (function () {
                var result = [];
                for (var _i = 0, _a = Array.from(_this.itemViews); _i < _a.length; _i++) {
                    var itemView = _a[_i];
                    if (itemView.isSelectable()) {
                        result.push(itemView.select(true));
                    }
                    else {
                        result.push(undefined);
                    }
                }
                return result;
            })();
        };
        ContainerView.prototype.selectNone = function () {
            var _this = this;
            return (function () {
                var result = [];
                for (var _i = 0, _a = Array.from(_this.itemViews); _i < _a.length; _i++) {
                    var itemView = _a[_i];
                    if (itemView.isSelectable()) {
                        result.push(itemView.select(false));
                    }
                    else {
                        result.push(undefined);
                    }
                }
                return result;
            })();
        };
        ContainerView.prototype.selectInvert = function () {
            var _this = this;
            return (function () {
                var result = [];
                for (var _i = 0, _a = Array.from(_this.itemViews); _i < _a.length; _i++) {
                    var itemView = _a[_i];
                    if (itemView.isSelectable()) {
                        result.push(itemView.toggleSelect());
                    }
                    else {
                        result.push(undefined);
                    }
                }
                return result;
            })();
        };
        ContainerView.prototype.getInitialDirectory = function (suggestedPath) {
            if ((suggestedPath != null) && fs.isDirectorySync(suggestedPath)) {
                return this.localFileSystem.getDirectory(suggestedPath);
            }
            var directories = atom.project.getDirectories();
            if (directories.length > 0) {
                return this.localFileSystem.getDirectory(directories[0].getRealPathSync());
            }
            return this.localFileSystem.getDirectory(fs.getHomeDirectory());
        };
        ContainerView.prototype.fileSystemRemoved = function (fileSystem) {
            if (this.directory.getFileSystem() === fileSystem) {
                return this.openDirectory(this.getInitialDirectory(this.lastLocalPath));
            }
        };
        ContainerView.prototype.serverClosed = function (server) {
            if (this.directory.getFileSystem() === server.getFileSystem()) {
                return this.openDirectory(this.getInitialDirectory(this.lastLocalPath));
            }
        };
        ContainerView.prototype.isSizeColumnVisible = function () {
            return this.getMainView().isSizeColumnVisible();
        };
        ContainerView.prototype.isDateColumnVisible = function () {
            return this.getMainView().isDateColumnVisible();
        };
        ContainerView.prototype.isExtensionColumnVisible = function () {
            return this.getMainView().isExtensionColumnVisible();
        };
        ContainerView.prototype.setSizeColumnVisible = function (visible) { };
        ContainerView.prototype.setDateColumnVisible = function (visible) { };
        ContainerView.prototype.setExtensionColumnVisible = function (visible) { };
        ContainerView.prototype.setSortBy = function (sortBy) {
            if (this.sortBy === sortBy) {
                if (sortBy === null) {
                    return;
                }
                this.sortAscending = !this.sortAscending;
            }
            else {
                this.sortBy = sortBy;
                this.sortAscending = true;
            }
            if (sortBy === null) {
                return this.refreshDirectory();
            }
            else {
                return this.sort(true);
            }
        };
        ContainerView.prototype.sort = function (scrollToHighlight) {
            var itemView;
            if (scrollToHighlight == null) {
                scrollToHighlight = false;
            }
            if (this.itemViews.length === 0) {
                return;
            }
            var prevHighlightIndex = this.highlightedIndex;
            this.highlightIndex(null, false);
            this.clearItemViews();
            // Separate files and directories.
            var parentItemView = null;
            var dirItemViews = [];
            var fileItemViews = [];
            for (var _i = 0, _a = Array.from(this.itemViews); _i < _a.length; _i++) {
                itemView = _a[_i];
                var item = itemView.getItem();
                if (item.isFile()) {
                    fileItemViews.push(itemView);
                }
                else if (item.isDirectory()) {
                    if (itemView.isForParentDirectory()) {
                        parentItemView = itemView;
                    }
                    else {
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
            var index = 0;
            var newHighlightIndex = null;
            for (var _b = 0, _c = Array.from(this.itemViews); _b < _c.length; _b++) {
                itemView = _c[_b];
                if ((newHighlightIndex == null) && (itemView.index === prevHighlightIndex)) {
                    newHighlightIndex = index;
                }
                itemView.index = index++;
                this.addItemView(itemView);
            }
            this.highlightIndex(newHighlightIndex, scrollToHighlight);
            return this.refreshSortIcons(this.sortBy, this.sortAscending);
        };
        ContainerView.prototype.deserialize = function (path, state) {
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
            var snapShot = {};
            snapShot.name = state.highlight;
            return this.openDirectory(this.getInitialDirectory(state.path), snapShot);
        };
        // if state.highlight?
        //   @highlightIndexWithName(state.highlight);
        ContainerView.prototype.serialize = function () {
            var state = {};
            state.sortBy = this.sortBy;
            state.sortAscending = this.sortAscending;
            if (this.directory.isLocal()) {
                state.path = this.getPath();
                state.highlight = this.getHighlightedItemName();
            }
            else {
                state.path = this.lastLocalPath;
            }
            return state;
        };
        ContainerView.prototype.dispose = function () {
            return this.disposables.dispose();
        };
        return ContainerView;
    }(View)));
//# sourceMappingURL=container-view.js.map