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
 * DS206: Consider reworking classes to avoid initClass
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var AtomCommanderView;
var fs = require('fs-plus');
var _a = require('atom'), Directory = _a.Directory, Task = _a.Task;
var _b = require('atom-space-pen-views'), $ = _b.$, View = _b.View;
var ListView = require('./views/list-view');
var MenuBarView = require('./views/menu/menu-bar-view');
var NewFileDialog = require('./dialogs/new-file-dialog');
var NewDirectoryDialog = require('./dialogs/new-directory-dialog');
var RenameDialog = require('./dialogs/rename-dialog');
var DuplicateFileDialog = require('./dialogs/duplicate-file-dialog');
var FileController = require('./controllers/file-controller');
var DirectoryController = require('./controllers/directory-controller');
var FTPFileSystem = require('./fs/ftp/ftp-filesystem');
var Utils = require('./utils');
var TabbedView = require('./views/tabbed-view');
module.exports =
    (AtomCommanderView = (function () {
        AtomCommanderView = /** @class */ (function (_super) {
            __extends(AtomCommanderView, _super);
            function AtomCommanderView(main, state) {
                var _this = this;
                _this.resizeStarted = _this.resizeStarted.bind(_this);
                _this.resizeStopped = _this.resizeStopped.bind(_this);
                _this.resizeView = _this.resizeView.bind(_this);
                _this.main = main;
                _this = _super.call(this, _this.main) || this;
                _this.alternateButtons = false;
                _this.sizeColumnVisible = state.sizeColumnVisible;
                _this.dateColumnVisible = state.dateColumnVisible;
                _this.extensionColumnVisible = state.extensionColumnVisible;
                if ((_this.sizeColumnVisible == null)) {
                    _this.sizeColumnVisible = false;
                }
                if ((_this.dateColumnVisible == null)) {
                    _this.dateColumnVisible = false;
                }
                if ((_this.extensionColumnVisible == null)) {
                    _this.extensionColumnVisible = true;
                }
                _this.menuBar.setMainView(_this);
                _this.leftTabbedView.setMainView(_this);
                _this.rightTabbedView.setMainView(_this);
                _this.leftTabbedView.addClass('left');
                _this.rightTabbedView.addClass('right');
                _this.leftTabbedView.deserialize(state.version, state.leftPath, state.left);
                _this.rightTabbedView.deserialize(state.version, state.rightPath, state.right);
                _this.leftView = _this.leftTabbedView.getSelectedView();
                _this.rightView = _this.rightTabbedView.getSelectedView();
                _this.horizontal = true;
                _this.customHeight = state.height;
                if (!atom.config.get('atom-commander.panel.showInDock')) {
                    _this.setHeight(state.height);
                }
                _this.focusedView = _this.getLeftView();
                return _this;
            }
            AtomCommanderView.initClass = function () {
                this.ATOM_COMMANDER_URI = 'atom://atom-commander';
            };
            AtomCommanderView.content = function () {
                var _this = this;
                var buttonStyle = '';
                return this.div({ "class": 'atom-commander' }, function () {
                    _this.div({ "class": 'atom-commander-resize-handle', outlet: 'resizeHandle' });
                    _this.subview('menuBar', new MenuBarView());
                    _this.div({ "class": 'content', outlet: 'contentView' }, function () {
                        _this.subview('leftTabbedView', new TabbedView(true));
                        return _this.subview('rightTabbedView', new TabbedView(false));
                    });
                    return _this.div({ tabindex: -1, "class": 'atom-commander-button-bar btn-group-xs' }, function () {
                        _this.button({ tabindex: -1, "class": 'btn', style: buttonStyle, click: 'menuButton' }, function () {
                            _this.span('Alt', { "class": 'key text-highlight' });
                            return _this.span('Menu');
                        });
                        _this.button({ tabindex: -1, "class": 'btn', style: buttonStyle, click: 'renameButton' }, function () {
                            _this.span('F2', { "class": 'key text-highlight' });
                            return _this.span('Rename');
                        });
                        _this.button({ tabindex: -1, "class": 'btn', style: buttonStyle, click: 'addRemoveProjectButton' }, function () {
                            _this.span('F3', { "class": 'key text-highlight' });
                            return _this.span('Add Project', { outlet: 'F3ButtonLabel' });
                        });
                        _this.button({ tabindex: -1, "class": 'btn', style: buttonStyle, click: 'newFileButton' }, function () {
                            _this.span('F4', { "class": 'key text-highlight' });
                            return _this.span('New File');
                        });
                        _this.button({ tabindex: -1, "class": 'btn', style: buttonStyle, click: 'copyDuplicateButton' }, function () {
                            _this.span('F5', { "class": 'key text-highlight' });
                            return _this.span('Copy', { outlet: 'F5ButtonLabel' });
                        });
                        _this.button({ tabindex: -1, "class": 'btn', style: buttonStyle, click: 'moveButton' }, function () {
                            _this.span('F6', { "class": 'key text-highlight' });
                            return _this.span('Move');
                        });
                        _this.button({ tabindex: -1, "class": 'btn', style: buttonStyle, click: 'newDirectoryButton' }, function () {
                            _this.span('F7', { "class": 'key text-highlight' });
                            return _this.span('New Folder');
                        });
                        _this.button({ tabindex: -1, "class": 'btn', style: buttonStyle, click: 'deleteButton' }, function () {
                            _this.span('F8', { "class": 'key text-highlight' });
                            return _this.span('Delete');
                        });
                        _this.button({ tabindex: -1, "class": 'btn', style: buttonStyle, click: 'focusButton' }, function () {
                            _this.span('F9', { "class": 'key text-highlight' });
                            return _this.span('Focus');
                        });
                        _this.button({ tabindex: -1, "class": 'btn', style: buttonStyle, click: 'hideButton' }, function () {
                            _this.span('F10', { "class": 'key text-highlight' });
                            return _this.span('Hide');
                        });
                        return _this.button({ tabindex: -1, "class": 'btn', style: buttonStyle, click: 'shiftButton' }, function () {
                            _this.span('Shift', { "class": 'key text-highlight' });
                            return _this.span('More...');
                        });
                    });
                });
            };
            AtomCommanderView.prototype.initialize = function () {
                var _this = this;
                this.menuBar.hide();
                atom.commands.add(this.element, {
                    'atom-commander:focus-other-view': function () { return _this.focusOtherView(); },
                    'atom-commander:rename': function () { return _this.renameButton(); },
                    'atom-commander:add-project': function () { return _this.addProjectButton(); },
                    'atom-commander:remove-project': function () { return _this.removeProjectButton(); },
                    'atom-commander:new-file': function () { return _this.newFileButton(); },
                    'atom-commander:copy': function () { return _this.copyButton(); },
                    'atom-commander:duplicate': function () { return _this.duplicateButton(); },
                    'atom-commander:move': function () { return _this.moveButton(); },
                    'atom-commander:new-folder': function () { return _this.newDirectoryButton(); },
                    'atom-commander:delete': function () { return _this.deleteButton(); },
                    'atom-commander:focus': function () { return _this.focusButton(); },
                    'atom-commander:hide': function () { return _this.hideButton(); },
                    'atom-commander:mirror': function () { return _this.mirror(); },
                    'atom-commander:add-tab': function () { return _this.addTab(); },
                    'atom-commander:remove-tab': function () { return _this.removeTab(); },
                    'atom-commander:previous-tab': function () { return _this.previousTab(); },
                    'atom-commander:next-tab': function () { return _this.nextTab(); },
                    'atom-commander:shift-tab-left': function () { return _this.shiftTabLeft(); },
                    'atom-commander:shift-tab-right': function () { return _this.shiftTabRight(); },
                    'atom-commander:copy-paths': function () { return _this.copyPaths(false); },
                    'atom-commander:copy-path-names': function () { return _this.copyPaths(true); }
                });
                if (atom.config.get('atom-commander.panel.showInDock')) {
                    this.resizeHandle.hide();
                }
                this.on('mousedown', '.atom-commander-resize-handle', function (e) { return _this.resizeStarted(e); });
                this.keyup(function (e) { return _this.handleKeyUp(e); });
                this.keydown(function (e) { return _this.handleKeyDown(e); });
                return this.keypress(function (e) { return _this.handleKeyPress(e); });
            };
            AtomCommanderView.prototype.destroy = function () {
                this.leftView.dispose();
                this.rightView.dispose();
                this.menuBar.dispose();
                return this.element.remove();
            };
            AtomCommanderView.prototype.getTitle = function () {
                return 'Atom Commander';
            };
            AtomCommanderView.prototype.getURI = function () {
                return AtomCommanderView.ATOM_COMMANDER_URI;
            };
            AtomCommanderView.prototype.getPreferredLocation = function () {
                return 'bottom';
            };
            AtomCommanderView.prototype.getAllowedLocations = function () {
                return ['bottom', 'left', 'right'];
            };
            AtomCommanderView.prototype.isPermanentDockItem = function () {
                return false;
            };
            AtomCommanderView.prototype.getElement = function () {
                return this.element;
            };
            AtomCommanderView.prototype.handleKeyDown = function (e) {
                if (e.altKey && !e.ctrlKey && !e.metaKey && this.menuBar.isHidden()) {
                    this.showMenuBar();
                    e.preventDefault();
                    return e.stopPropagation();
                }
                else if (this.menuBar.isVisible()) {
                    this.menuBar.handleKeyDown(e);
                    e.preventDefault();
                    return e.stopPropagation();
                }
                else if (e.shiftKey) {
                    return this.showAlternateButtons();
                }
            };
            AtomCommanderView.prototype.handleKeyUp = function (e) {
                if (e.altKey) {
                    this.menuBar.handleKeyUp(e);
                    e.preventDefault();
                    return e.stopPropagation();
                }
                else if (this.menuBar.isVisible()) {
                    this.hideMenuBar();
                    e.preventDefault();
                    return e.stopPropagation();
                }
                else if (!e.shiftKey) {
                    return this.hideAlternateButtons();
                }
            };
            AtomCommanderView.prototype.handleKeyPress = function (e) {
                if (this.menuBar.isVisible()) {
                    this.menuBar.handleKeyUp(e);
                    e.preventDefault();
                    return e.stopPropagation();
                }
            };
            AtomCommanderView.prototype.toggleMenuBar = function () {
                if (this.menuBar.isVisible()) {
                    return this.hideMenuBar();
                }
                else {
                    return this.showMenuBar();
                }
            };
            AtomCommanderView.prototype.showMenuBar = function () {
                this.menuBar.reset();
                return this.menuBar.show();
            };
            AtomCommanderView.prototype.hideMenuBar = function () {
                this.menuBar.hide();
                this.menuBar.reset();
                return this.refocusLastView();
            };
            AtomCommanderView.prototype.toggleAlternateButtons = function () {
                if (this.alternateButtons) {
                    return this.hideAlternateButtons();
                }
                else {
                    return this.showAlternateButtons();
                }
            };
            AtomCommanderView.prototype.showAlternateButtons = function () {
                this.alternateButtons = true;
                this.F3ButtonLabel.text("Remove Project");
                return this.F5ButtonLabel.text("Duplicate");
            };
            AtomCommanderView.prototype.hideAlternateButtons = function () {
                this.alternateButtons = false;
                this.F3ButtonLabel.text("Add Project");
                return this.F5ButtonLabel.text("Copy");
            };
            AtomCommanderView.prototype.resizeStarted = function () {
                $(document).on('mousemove', this.resizeView);
                return $(document).on('mouseup', this.resizeStopped);
            };
            AtomCommanderView.prototype.resizeStopped = function () {
                $(document).off('mousemove', this.resizeView);
                return $(document).off('mouseup', this.resizeStopped);
            };
            AtomCommanderView.prototype.resizeView = function (_a) {
                var pageY = _a.pageY, which = _a.which;
                if (which !== 1) {
                    return this.resizeStopped();
                }
                var change = this.offset().top - pageY;
                return this.setHeight(this.outerHeight() + change);
            };
            AtomCommanderView.prototype.setHeight = function (customHeight) {
                this.customHeight = customHeight;
                if ((this.customHeight == null)) {
                    this.customHeight = 200;
                }
                else if (this.customHeight < 50) {
                    this.customHeight = 50;
                }
                return this.height(this.customHeight);
            };
            AtomCommanderView.prototype.getMain = function () {
                return this.main;
            };
            AtomCommanderView.prototype.getLeftView = function () {
                return this.leftTabbedView.getSelectedView();
            };
            AtomCommanderView.prototype.getRightView = function () {
                return this.rightTabbedView.getSelectedView();
            };
            AtomCommanderView.prototype.getOtherView = function (view) {
                if (view.isLeft()) {
                    return this.getRightView();
                }
                return this.getLeftView();
            };
            AtomCommanderView.prototype.setHorizontal = function (horizontal) {
                this.horizontal = horizontal;
                if (this.horizontal) {
                    this.contentView.addClass('content-horizontal');
                    this.contentView.removeClass('content-vertical');
                }
                else {
                    this.contentView.addClass('content-vertical');
                    this.contentView.removeClass('content-horizontal');
                }
                this.getLeftView().setHorizontal(horizontal);
                this.getRightView().setHorizontal(horizontal);
                return this.applyVisibility();
            };
            AtomCommanderView.prototype.focusView = function (focusedView) {
                this.focusedView = focusedView;
                var otherView = this.getOtherView(this.focusedView);
                otherView.unfocus();
                this.applyVisibility();
                return this.focusedView.focus();
            };
            AtomCommanderView.prototype.showInDockChanged = function (height) { };
            // TODO : Call this when toggling docked mode without recreating main view.
            // if atom.config.get('atom-commander.panel.showInDock')
            //   @height('100%')
            //   @resizeHandle.hide();
            //   @applyVisibility();
            // else
            //   @height(height);
            //   @resizeHandle.show();
            //   @setHorizontal(true);
            AtomCommanderView.prototype.applyVisibility = function () {
                var onlyOne = atom.config.get('atom-commander.panel.onlyOneWhenVertical');
                if (this.horizontal || !onlyOne) {
                    this.leftTabbedView.show();
                    this.rightTabbedView.show();
                    return;
                }
                if (this.getRightView() === this.focusedView) {
                    this.leftTabbedView.hide();
                    return this.rightTabbedView.show();
                }
                else {
                    this.leftTabbedView.show();
                    return this.rightTabbedView.hide();
                }
            };
            AtomCommanderView.prototype.focusOtherView = function () {
                if (this.getLeftView().hasFocus()) {
                    return this.focusView(this.getRightView());
                }
                else {
                    return this.focusView(this.getLeftView());
                }
            };
            AtomCommanderView.prototype.addRemoveProjectButton = function () {
                if (this.alternateButtons) {
                    return this.removeProjectButton();
                }
                else {
                    return this.addProjectButton();
                }
            };
            AtomCommanderView.prototype.addProjectButton = function () {
                if (this.focusedView !== null) {
                    return this.focusedView.addProject();
                }
            };
            AtomCommanderView.prototype.removeProjectButton = function () {
                if (this.focusedView !== null) {
                    return this.focusedView.removeProject();
                }
            };
            AtomCommanderView.prototype.getFocusedViewDirectory = function () {
                if (this.focusedView === null) {
                    return null;
                }
                return this.focusedView.directory;
            };
            AtomCommanderView.prototype.menuButton = function () {
                return this.toggleMenuBar();
            };
            AtomCommanderView.prototype.shiftButton = function () {
                return this.toggleAlternateButtons();
            };
            AtomCommanderView.prototype.renameButton = function () {
                var dialog;
                if (this.focusedView === null) {
                    return;
                }
                var itemView = this.focusedView.getHighlightedItem();
                if ((itemView === null) || !itemView.canRename()) {
                    return;
                }
                if (itemView.itemController instanceof FileController) {
                    dialog = new RenameDialog(this.focusedView, itemView.itemController.getFile());
                    return dialog.attach();
                }
                else if (itemView.itemController instanceof DirectoryController) {
                    dialog = new RenameDialog(this.focusedView, itemView.itemController.getDirectory());
                    return dialog.attach();
                }
            };
            AtomCommanderView.prototype.newFileButton = function () {
                var directory = this.getFocusedViewDirectory();
                if (directory === null) {
                    return;
                }
                var dialog = new NewFileDialog(this.focusedView, directory, this.focusedView.getNames());
                return dialog.attach();
            };
            AtomCommanderView.prototype.copyDuplicateButton = function () {
                if (this.alternateButtons) {
                    return this.duplicateButton();
                }
                else {
                    return this.copyButton();
                }
            };
            AtomCommanderView.prototype.copyButton = function () {
                return this.copyOrMoveButton(false);
            };
            AtomCommanderView.prototype.moveButton = function () {
                return this.copyOrMoveButton(true);
            };
            AtomCommanderView.prototype.copyOrMoveButton = function (move) {
                var items, srcItemView;
                if (this.focusedView === null) {
                    return;
                }
                var srcView = this.focusedView;
                var dstView = this.getOtherView(srcView);
                // Do nothing if the src and dst folders are the same.
                if (srcView.getURI() === dstView.getURI()) {
                    return;
                }
                // Do nothing if nothing is selected.
                var srcItemViews = srcView.getSelectedItemViews(true);
                if (srcItemViews.length === 0) {
                    return;
                }
                var srcFileSystem = srcView.directory.fileSystem;
                var dstFileSystem = dstView.directory.fileSystem;
                if (move) {
                    if (srcFileSystem.isRemote() || dstFileSystem.isRemote()) {
                        atom.notifications.addWarning("Move to/from remote file systems is not yet supported.");
                        return;
                    }
                }
                else if (srcFileSystem.isRemote() && dstFileSystem.isRemote()) {
                    atom.notifications.addWarning("Copy between remote file systems is not yet supported.");
                    return;
                }
                var srcPath = srcView.getPath();
                var dstPath = dstView.getPath();
                if (srcFileSystem.isRemote()) {
                    items = [];
                    for (var _i = 0, _a = Array.from(srcItemViews); _i < _a.length; _i++) {
                        srcItemView = _a[_i];
                        items.push(srcItemView.getItem());
                    }
                    srcFileSystem.getTaskManager().downloadItems(dstPath, items, function (canceled, err, item) {
                        if (!canceled && (err != null)) {
                            var message = "Error downloading " + item.getURI();
                            return Utils.showErrorWarning("Download failed", message, null, err, true);
                        }
                    });
                    return;
                }
                if (dstFileSystem.isRemote()) {
                    items = [];
                    for (var _b = 0, _c = Array.from(srcItemViews); _b < _c.length; _b++) {
                        srcItemView = _c[_b];
                        items.push(srcItemView.getItem());
                    }
                    dstFileSystem.getTaskManager().uploadItems(dstPath, items, function (canceled, err, item) {
                        if (!canceled && (err != null)) {
                            var message = "Error uploading " + item.getURI();
                            return Utils.showErrorWarning("Upload failed", message, null, err, true);
                        }
                    });
                    return;
                }
                var srcNames = [];
                for (var _d = 0, _e = Array.from(srcItemViews); _d < _e.length; _d++) {
                    srcItemView = _e[_d];
                    srcNames.push(srcItemView.getName());
                }
                var task = Task.once(require.resolve('./tasks/copy-task'), srcPath, srcNames, dstPath, move, function () {
                    if (move) {
                        srcView.refreshDirectory();
                    }
                    return dstView.refreshDirectory();
                });
                return task.on('success', function (data) {
                    return srcItemViews[data.index].select(false);
                });
            };
            AtomCommanderView.prototype.duplicateButton = function () {
                if (this.focusedView === null) {
                    return;
                }
                var fileSystem = this.focusedView.directory.fileSystem;
                if (fileSystem.isRemote()) {
                    atom.notifications.addWarning("Duplicate on remote file systems is not yet supported.");
                    return;
                }
                var itemView = this.focusedView.getHighlightedItem();
                if ((itemView === null) || !itemView.isSelectable()) {
                    return;
                }
                var item = itemView.getItem();
                if (item.isFile() || item.isDirectory()) {
                    var dialog = new DuplicateFileDialog(this.focusedView, item);
                    return dialog.attach();
                }
            };
            AtomCommanderView.prototype.deleteButton = function () {
                var _this = this;
                if (this.focusedView === null) {
                    return;
                }
                // Create a local variable of the focused view in case the focus changes while deleting.
                var view = this.focusedView;
                var itemViews = view.getSelectedItemViews(true);
                if (itemViews.length === 0) {
                    return;
                }
                var detailedMessage = "Delete the selected items?";
                if (itemViews.length === 1) {
                    var itemView = itemViews[0];
                    if (itemView.getItem().isFile()) {
                        detailedMessage = "Delete the file '" + itemView.getName() + "'?";
                    }
                    else {
                        detailedMessage = "Delete the folder '" + itemView.getName() + "'?";
                    }
                }
                var response = atom.confirm({
                    message: "Delete",
                    detailedMessage: detailedMessage,
                    buttons: ["No", "Yes"]
                });
                if (response === 0) {
                    return;
                }
                var index = 0;
                var callback = function (err) {
                    if (err != null) {
                        var title = "Error deleting " + itemViews[index].getItem().getPath();
                        var post = null;
                        if (itemViews[index].getItem().isDirectory()) {
                            post = "Make sure the folder is empty before deleting it.";
                        }
                        Utils.showErrorWarning(title, null, post, err, true);
                    }
                    index++;
                    if (index === itemViews.length) {
                        return _this.focusedView.refreshDirectory();
                    }
                    else {
                        return itemViews[index].getItem()["delete"](callback);
                    }
                };
                return itemViews[0].getItem()["delete"](callback);
            };
            AtomCommanderView.prototype.newDirectoryButton = function () {
                var directory = this.getFocusedViewDirectory();
                if (directory === null) {
                    return;
                }
                var dialog = new NewDirectoryDialog(this.focusedView, directory);
                return dialog.attach();
            };
            AtomCommanderView.prototype.focusButton = function () {
                return this.main.toggleFocus();
            };
            AtomCommanderView.prototype.hideButton = function () {
                return this.main.hide();
            };
            AtomCommanderView.prototype.mirror = function () {
                if (this.focusedView !== null) {
                    var snapShot = this.focusedView.captureSnapShot();
                    return this.getOtherView(this.focusedView).openDirectory(this.focusedView.directory, snapShot);
                }
            };
            AtomCommanderView.prototype.swap = function () {
                if (this.focusedView === null) {
                    return;
                }
                var otherView = this.getOtherView(this.focusedView);
                var snapShot = this.focusedView.captureSnapShot();
                var otherSnapShot = otherView.captureSnapShot();
                var directory = this.focusedView.directory;
                var otherDirectory = otherView.directory;
                this.focusedView.openDirectory(otherDirectory, otherSnapShot);
                otherView.openDirectory(directory, snapShot);
                return otherView.requestFocus();
            };
            AtomCommanderView.prototype.refocusLastView = function () {
                if (this.focusedView !== null) {
                    return this.focusView(this.focusedView);
                }
                else {
                    return this.focusView(this.getLeftView());
                }
            };
            AtomCommanderView.prototype.getFocusedTabbedView = function () {
                if (this.focusedView === null) {
                    return null;
                }
                if (this.focusedView.isLeft()) {
                    return this.leftTabbedView;
                }
                return this.rightTabbedView;
            };
            AtomCommanderView.prototype.addTab = function () {
                var focusedTabbedView = this.getFocusedTabbedView();
                if (focusedTabbedView === null) {
                    return;
                }
                return focusedTabbedView.insertTab();
            };
            AtomCommanderView.prototype.removeTab = function () {
                var focusedTabbedView = this.getFocusedTabbedView();
                if (focusedTabbedView === null) {
                    return;
                }
                return focusedTabbedView.removeSelectedTab();
            };
            AtomCommanderView.prototype.previousTab = function () {
                var focusedTabbedView = this.getFocusedTabbedView();
                if (focusedTabbedView !== null) {
                    return focusedTabbedView.previousTab();
                }
            };
            AtomCommanderView.prototype.nextTab = function () {
                var focusedTabbedView = this.getFocusedTabbedView();
                if (focusedTabbedView !== null) {
                    return focusedTabbedView.nextTab();
                }
            };
            AtomCommanderView.prototype.shiftTabLeft = function () {
                var focusedTabbedView = this.getFocusedTabbedView();
                if (focusedTabbedView !== null) {
                    return focusedTabbedView.shiftLeft();
                }
            };
            AtomCommanderView.prototype.shiftTabRight = function () {
                var focusedTabbedView = this.getFocusedTabbedView();
                if (focusedTabbedView !== null) {
                    return focusedTabbedView.shiftRight();
                }
            };
            AtomCommanderView.prototype.copyPaths = function (namesOnly) {
                if (this.focusedView !== null) {
                    var itemViews = this.focusedView.getSelectedItemViews(true);
                    if (itemViews.length > 0) {
                        var paths = void 0;
                        if (namesOnly) {
                            paths = itemViews.map(function (i) { return i.getName(); });
                        }
                        else {
                            paths = itemViews.map(function (i) { return i.getPath(); });
                        }
                        var text = paths.join('\n');
                        atom.clipboard.write(text);
                        if (paths.length === 1) {
                            if (namesOnly) {
                                return atom.notifications.addInfo('Copied name \'' + paths[0] + '\' to clipboard.');
                            }
                            else {
                                return atom.notifications.addInfo('Copied path \'' + paths[0] + '\' to clipboard.');
                            }
                        }
                        else {
                            if (namesOnly) {
                                return atom.notifications.addInfo('Copied ' + paths.length + ' names to clipboard.');
                            }
                            else {
                                return atom.notifications.addInfo('Copied ' + paths.length + ' paths to clipboard.');
                            }
                        }
                    }
                }
            };
            AtomCommanderView.prototype.tabCountChanged = function () {
                var totalTabs = this.leftTabbedView.getTabCount() + this.rightTabbedView.getTabCount();
                this.leftTabbedView.setTabsVisible(totalTabs > 2);
                return this.rightTabbedView.setTabsVisible(totalTabs > 2);
            };
            AtomCommanderView.prototype.fileSystemRemoved = function (fileSystem) {
                this.leftTabbedView.fileSystemRemoved(fileSystem);
                return this.rightTabbedView.fileSystemRemoved(fileSystem);
            };
            AtomCommanderView.prototype.serverClosed = function (server) {
                this.leftTabbedView.serverClosed(server);
                return this.rightTabbedView.serverClosed(server);
            };
            AtomCommanderView.prototype.isSizeColumnVisible = function () {
                return this.sizeColumnVisible;
            };
            AtomCommanderView.prototype.isDateColumnVisible = function () {
                return this.dateColumnVisible;
            };
            AtomCommanderView.prototype.isExtensionColumnVisible = function () {
                return this.extensionColumnVisible;
            };
            AtomCommanderView.prototype.toggleSizeColumn = function () {
                this.sizeColumnVisible = !this.sizeColumnVisible;
                this.leftTabbedView.setSizeColumnVisible(this.sizeColumnVisible);
                return this.rightTabbedView.setSizeColumnVisible(this.sizeColumnVisible);
            };
            AtomCommanderView.prototype.toggleDateColumn = function () {
                this.dateColumnVisible = !this.dateColumnVisible;
                this.leftTabbedView.setDateColumnVisible(this.dateColumnVisible);
                return this.rightTabbedView.setDateColumnVisible(this.dateColumnVisible);
            };
            AtomCommanderView.prototype.toggleExtensionColumn = function () {
                this.extensionColumnVisible = !this.extensionColumnVisible;
                this.leftTabbedView.setExtensionColumnVisible(this.extensionColumnVisible);
                return this.rightTabbedView.setExtensionColumnVisible(this.extensionColumnVisible);
            };
            AtomCommanderView.prototype.setSortBy = function (sortBy) {
                if (this.focusedView !== null) {
                    return this.focusedView.setSortBy(sortBy);
                }
            };
            AtomCommanderView.prototype.serialize = function () {
                var state = {};
                state.left = this.leftTabbedView.serialize();
                state.right = this.rightTabbedView.serialize();
                state.sizeColumnVisible = this.sizeColumnVisible;
                state.dateColumnVisible = this.dateColumnVisible;
                state.extensionColumnVisible = this.extensionColumnVisible;
                state.height = this.customHeight;
                return state;
            };
            return AtomCommanderView;
        }(View));
        AtomCommanderView.initClass();
        return AtomCommanderView;
    })());
//# sourceMappingURL=atom-commander-view.js.map