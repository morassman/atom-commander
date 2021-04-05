/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__, or convert again using --optional-chaining
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var AtomCommander;
var Actions = require('./actions');
var Schemas = require('./schemas');
var ListView = require('./views/list-view');
var DiffView = require('./views/diff/diff-view');
var StatusView = require('./views/status-view');
var AtomCommanderView = require('./atom-commander-view');
var BookmarkManager = require('./bookmark-manager');
var ServerManager = require('./servers/server-manager');
var LocalFileSystem = require('./fs/local/local-filesystem');
var _a = require('atom'), CompositeDisposable = _a.CompositeDisposable, File = _a.File, Directory = _a.Directory;
var fsp = null;
module.exports = (AtomCommander = {
    config: {
        panel: {
            type: "object",
            properties: {
                showInDock: {
                    title: "Show In Dock",
                    description: "Show the panel in the dock. Disable to limit the panel to the bottom of the screen.",
                    type: "boolean",
                    "default": true,
                    order: 1
                },
                onlyOneWhenVertical: {
                    title: "Single Browser When Docked Left Or Right",
                    description: "Show only one browser at a time when the panel is docked on the left or right. Tabbing will toggle between them.",
                    type: "boolean",
                    "default": false,
                    order: 2
                },
                hideOnOpen: {
                    title: "Hide After Opening File",
                    description: "Hide the panel after opening a file and then focus the editor.",
                    type: "boolean",
                    "default": false,
                    order: 3
                }
            }
        },
        menu: {
            type: "object",
            properties: {
                showMenuDetails: {
                    title: "Show Menu Details",
                    description: "Show the details of all menus under the menu bar.",
                    type: "boolean",
                    "default": true
                }
            }
        },
        uploadOnSave: {
            title: "Upload Cached File On Save",
            description: "Automatically upload cached files when saved.",
            type: "boolean",
            "default": true
        },
        removeOnClose: {
            title: "Remove Cached File On Close",
            description: "Remove a cached file after it was closed and successfully uploaded.",
            type: "boolean",
            "default": true
        }
    },
    activate: function (state) {
        var _this = this;
        this.state = state;
        this.loadState();
        this.bookmarks = [];
        this.localFileSystem = new LocalFileSystem(this);
        this.actions = new Actions(this);
        this.bookmarkManager = new BookmarkManager(this, this.state.bookmarks);
        this.serverManager = new ServerManager(this, this.state.servers);
        // @mainView = new AtomCommanderView(@, @state);
        // @element = @mainView.getElement();
        this.subscriptions = new CompositeDisposable();
        this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:toggle-visible': function () { return _this.toggle(); } }));
        this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:toggle-focus': function () { return _this.toggleFocus(); } }));
        this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:select-all': function () { return _this.actions.selectAll(); } }));
        this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:select-none': function () { return _this.actions.selectNone(); } }));
        this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:select-add': function () { return _this.actions.selectAdd(); } }));
        this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:select-remove': function () { return _this.actions.selectRemove(); } }));
        this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:select-invert': function () { return _this.actions.selectInvert(); } }));
        this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:select-folders': function () { return _this.actions.selectFolders(); } }));
        this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:select-files': function () { return _this.actions.selectFiles(); } }));
        this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:refresh-view': function () { return _this.actions.viewRefresh(); } }));
        this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:mirror-view': function () { return _this.actions.viewMirror(); } }));
        this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:swap-view': function () { return _this.actions.viewSwap(); } }));
        this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:compare-folders': function () { return _this.actions.compareFolders(); } }));
        this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:compare-files': function () { return _this.actions.compareFiles(); } }));
        this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:go-project': function () { return _this.actions.goProject(); } }));
        this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:go-editor': function () { return _this.actions.goEditor(); } }));
        this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:go-drive': function () { return _this.actions.goDrive(); } }));
        this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:go-root': function () { return _this.actions.goRoot(); } }));
        this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:go-home': function () { return _this.actions.goHome(); } }));
        this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:add-bookmark': function () { return _this.actions.bookmarksAdd(false); } }));
        this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:remove-bookmark': function () { return _this.actions.bookmarksRemove(false); } }));
        this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:open-bookmark': function () { return _this.actions.bookmarksOpen(false); } }));
        this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:add-server': function () { return _this.actions.serversAdd(false); } }));
        this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:remove-server': function () { return _this.actions.serversRemove(false); } }));
        this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:open-server': function () { return _this.actions.serversOpen(false); } }));
        this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:close-server': function () { return _this.actions.serversClose(false); } }));
        this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:edit-server': function () { return _this.actions.serversEdit(false); } }));
        this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:open-cache': function () { return _this.actions.serversCache(false); } }));
        this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:open-terminal': function () { return _this.actions.openTerminal(); } }));
        this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:show-in-file-manager': function () { return _this.actions.openFileSystem(); } }));
        this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:open-with-system': function () { return _this.actions.openSystem(); } }));
        this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:toggle-size-column': function () { return _this.actions.toggleSizeColumn(); } }));
        this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:toggle-date-column': function () { return _this.actions.toggleDateColumn(); } }));
        this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:toggle-extension-column': function () { return _this.actions.toggleExtensionColumn(); } }));
        this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:sort-by-name': function () { return _this.actions.sortByName(); } }));
        this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:sort-by-extension': function () { return _this.actions.sortByExtension(); } }));
        this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:sort-by-size': function () { return _this.actions.sortBySize(); } }));
        this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:sort-by-date': function () { return _this.actions.sortByDate(); } }));
        this.subscriptions.add(atom.commands.add('atom-workspace', { 'atom-commander:sort-by-default': function () { return _this.actions.sortByDefault(); } }));
        this.subscriptions.add(atom.commands.add('atom-text-editor', { 'atom-commander:upload-file': function (event) {
                event.stopPropagation();
                return _this.actions.uploadFile();
            }
        }));
        this.subscriptions.add(atom.commands.add('atom-text-editor', { 'atom-commander:download-file': function (event) {
                event.stopPropagation();
                return _this.actions.downloadFile();
            }
        }));
        this.subscriptions.add(atom.commands.add('atom-text-editor', { 'atom-commander:compare-with-server': function (event) {
                event.stopPropagation();
                return _this.actions.compareWithServer();
            }
        }));
        this.subscriptions.add(atom.commands.add('atom-text-editor', { 'atom-commander:add-bookmark': function (event) {
                event.stopPropagation();
                return _this.actions.bookmarksAddEditor();
            }
        }));
        // Monitor active pane item in docks.
        this.subscriptions.add(atom.workspace.getLeftDock().onDidChangeActivePaneItem(function (event) {
            return _this.onDidChangeActivePaneItem(event);
        }));
        this.subscriptions.add(atom.workspace.getRightDock().onDidChangeActivePaneItem(function (event) {
            return _this.onDidChangeActivePaneItem(event);
        }));
        this.subscriptions.add(atom.workspace.getBottomDock().onDidChangeActivePaneItem(function (event) {
            return _this.onDidChangeActivePaneItem(event);
        }));
        this.subscriptions.add(atom.workspace.getLeftDock().onWillDestroyPaneItem(function (event) {
            return _this.onWillDestroyPaneItem(event);
        }));
        this.subscriptions.add(atom.workspace.getRightDock().onWillDestroyPaneItem(function (event) {
            return _this.onWillDestroyPaneItem(event);
        }));
        this.subscriptions.add(atom.workspace.getBottomDock().onWillDestroyPaneItem(function (event) {
            return _this.onWillDestroyPaneItem(event);
        }));
        // Monitor configuration
        this.subscriptions.add(atom.config.onDidChange('atom-commander.panel.onlyOneWhenVertical', function () {
            return (_this.mainView != null ? _this.mainView.applyVisibility() : undefined);
        }));
        this.subscriptions.add(atom.config.onDidChange('atom-commander.panel.showInDock', function () {
            return _this.showInDockChanged();
        }));
        if (!atom.config.get('atom-commander.panel.showInDock')) {
            this.bottomPanel = atom.workspace.addBottomPanel({ item: this.getMainView(true), visible: false });
        }
        if (this.state.visible) {
            return this.show(false);
        }
    },
    getMainView: function (createLazy) {
        if (createLazy == null) {
            createLazy = false;
        }
        if ((this.mainView == null) && createLazy) {
            this.mainView = new AtomCommanderView(this, this.state);
            this.element = this.mainView.getElement();
        }
        return this.mainView;
    },
    getActions: function () {
        return this.actions;
    },
    getLocalFileSystem: function () {
        return this.localFileSystem;
    },
    getBookmarkManager: function () {
        return this.bookmarkManager;
    },
    getServerManager: function () {
        return this.serverManager;
    },
    getSaveFile: function () {
        var configFile = new File(atom.config.getUserConfigPath());
        var directory = configFile.getParent();
        return directory.getFile("atom-commander.json");
    },
    loadState: function () {
        if ((this.state == null)) {
            this.state = Schemas.newState();
        }
        var file = this.getSaveFile();
        if (!file.existsSync()) {
            return;
        }
        if (fsp == null) {
            fsp = require('fs-plus');
        }
        try {
            this.state = JSON.parse(fsp.readFileSync(file.getPath()));
            return this.state = Schemas.upgrade(this.state);
        }
        catch (error) {
            console.log("Error loading Atom Commander state.");
            return console.log(error);
        }
    },
    saveState: function () {
        if (fsp == null) {
            fsp = require('fs-plus');
        }
        var state = this.serialize();
        var file = this.getSaveFile();
        try {
            return fsp.writeFileSync(file.getPath(), JSON.stringify(state));
        }
        catch (error) {
            console.log("Error saving Atom Commander state.");
            return console.log(error);
        }
    },
    deactivate: function () {
        this.saveState();
        if (this.bottomPanel != null) {
            this.bottomPanel.destroy();
        }
        this.subscriptions.dispose();
        this.serverManager.dispose();
        if (this.mainView != null) {
            this.mainView.destroy();
        }
        return (this.statusTile != null ? this.statusTile.destroy() : undefined);
    },
    serialize: function () {
        var state;
        if (this.mainView != null) {
            var visible = this.state.visible;
            state = this.mainView.serialize();
            state.visible = visible;
            state.bookmarks = this.bookmarkManager.serialize();
            state.servers = this.serverManager.serialize();
            state.version = 4;
            return state;
        }
        return this.state;
    },
    showInDockChanged: function () {
        var visible = this.isVisible();
        this.state = this.serialize();
        if (this.getDock() === atom.workspace.getBottomDock()) {
            this.state.height = this.getMainView().height();
        }
        if (this.bottomPanel != null) {
            this.bottomPanel.destroy();
            this.bottomPanel = null;
        }
        else {
            var pane = atom.workspace.paneForItem(this.mainView);
            if (pane != null) {
                pane.removeItem(this.mainView);
            }
        }
        if (this.mainView != null) {
            this.mainView.destroy();
        }
        this.mainView = null;
        if (!atom.config.get('atom-commander.panel.showInDock')) {
            this.bottomPanel = atom.workspace.addBottomPanel({ item: this.getMainView(true), visible: false });
        }
        // @mainView.showInDockChanged(@state.height);
        if (visible) {
            return this.show(false, 'bottom');
        }
    },
    onWillDestroyPaneItem: function (event) {
        if (event.item === this.mainView) {
            this.state.visible = false;
            this.saveState();
            this.mainView.destroy();
            return this.mainView = null;
        }
    },
    onDidChangeActivePaneItem: function (item) {
        if (item !== this.mainView) {
            return;
        }
        var dock = this.getDock();
        if (dock != null) {
            return this.getMainView().setHorizontal(dock.location === 'bottom');
        }
    },
    getDock: function () {
        if (atom.workspace.getBottomDock().getPaneItems().indexOf(this.mainView) >= 0) {
            return atom.workspace.getBottomDock();
        }
        if (atom.workspace.getLeftDock().getPaneItems().indexOf(this.mainView) >= 0) {
            return atom.workspace.getLeftDock();
        }
        if (atom.workspace.getRightDock().getPaneItems().indexOf(this.mainView) >= 0) {
            return atom.workspace.getRightDock();
        }
        return null;
    },
    isVisible: function () {
        if (this.bottomPanel) {
            return this.state.visible;
        }
        else {
            return this.isVisibleInDock();
        }
    },
    isVisibleInDock: function () {
        var dock = this.getDock();
        if ((dock == null) || !dock.isVisible()) {
            return false;
        }
        if ((dock.getActivePane() == null)) {
            return false;
        }
        return dock.getActivePane().getActiveItem() === this.mainView;
    },
    toggle: function () {
        if (this.isVisible()) {
            return this.hide();
        }
        else {
            return this.show(false);
        }
    },
    togglePanelVisible: function () {
        if (this.bottomPanel.isVisible()) {
            this.unfocus();
            return this.bottomPanel.hide();
        }
        else {
            return this.bottomPanel.show();
        }
    },
    show: function (focus, location) {
        if (location == null) {
            location = undefined;
        }
        if (this.bottomPanel != null) {
            this.showPanel(focus);
        }
        else {
            this.showDock(focus, location);
        }
        this.state.visible = true;
        return this.saveState();
    },
    showPanel: function (focus) {
        this.bottomPanel.show();
        if (focus) {
            return this.focus();
        }
    },
    showDock: function (focus, location) {
        var _this = this;
        var paneContainer = atom.workspace.paneContainerForURI(AtomCommanderView.ATOM_COMMANDER_URI);
        if (paneContainer != null) {
            paneContainer.show();
            if (focus) {
                return this.focus();
            }
        }
        else {
            return atom.workspace.open(this.getMainView(true), {
                searchAllPanes: true,
                activatePane: true,
                activateItem: true,
                location: location
            }).then(function () {
                paneContainer = atom.workspace.paneContainerForURI(AtomCommanderView.ATOM_COMMANDER_URI);
                if (paneContainer != null) {
                    paneContainer.show();
                    if (focus) {
                        return _this.focus();
                    }
                }
            });
        }
    },
    hide: function () {
        if (this.bottomPanel != null) {
            this.bottomPanel.hide();
        }
        else if (this.mainView != null) {
            atom.workspace.hide(this.mainView);
        }
        this.state.visible = false;
        return this.saveState();
    },
    focus: function () {
        return __guard__(this.getMainView(), function (x) { return x.refocusLastView(); });
    },
    unfocus: function () {
        return atom.workspace.getCenter().activate();
    },
    hasFocus: function () {
        if ((this.mainView == null)) {
            return false;
        }
        return (this.mainView.focusedView !== null) && this.mainView.focusedView.hasFocus();
    },
    toggleFocus: function () {
        if (this.hasFocus()) {
            return this.unfocus();
        }
        else {
            return this.show(true);
        }
    },
    consumeStatusBar: function (statusBar) {
        this.statusView = new StatusView();
        return this.statusTile = statusBar.addRightTile({ item: this.statusView });
    },
    refreshStatus: function () {
        if (this.statusView === null) {
            return;
        }
        this.statusView.setUploadCount(this.serverManager.getUploadCount());
        return this.statusView.setDownloadCount(this.serverManager.getDownloadCount());
    },
    fileSystemRemoved: function (fileSystem) {
        this.bookmarkManager.fileSystemRemoved(fileSystem);
        return (this.mainView != null ? this.mainView.fileSystemRemoved(fileSystem) : undefined);
    },
    serverClosed: function (server) {
        return (this.mainView != null ? this.mainView.serverClosed(server) : undefined);
    },
    getFileSystemWithID: function (fileSystemId) {
        if (this.localFileSystem.getID() === fileSystemId) {
            return this.localFileSystem;
        }
        return this.serverManager.getFileSystemWithID(fileSystemId);
    }
});
function __guard__(value, transform) {
    return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}
//# sourceMappingURL=atom-commander.js.map