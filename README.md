# Atom Commander

Dual-pane file manager for Atom.

Highlights:
- Navigate the file system from within Atom.
- Bookmark files and folders for quick access.
- Create multiple folder tabs.
- Compare files side-by-side.
- Open a terminal at the current folder.
- Browse and edit files via FTP and SFTP.
  - Keep multiple files cached until you're ready to upload them.
  - Compare a cached file with its remote counterpart before uploading it.

See the [changelog](https://github.com/morassman/atom-commander/blob/master/CHANGELOG.md) for the latest improvements.

After installing Atom Commander, press `F9` or choose `Atom Commander: Toggle Focus` from the Command Palette to show the panel and focus it. The panel can be hidden with `F10` or `Atom Commander: Toggle Visible`.

![Screenshot](https://github.com/morassman/atom-commander/blob/master/resources/panel.png?raw=true)

:bulb: **Good to know...**

While Atom Commander has focus, hold down the `Alt` key to see the quick menu. From here you can access all its features. Read more about it under the **Menus** section.

## Buttons
Button|Action
---|---
`F2 Rename`|Rename the highlighted file or folder.
`F3 Add Project`|Add the highlighted or selected folders as project folders to the workspace. If a folder isn't highlighted nor any folders selected then the folder currently being shown will be added.
`F4 New File`|Create a new file in the selected pane's folder and opens it for editing.
`F5 Copy`|Copy the selected files to the other pane.
`F6 Move`|Move the selected files to the other pane.
`F7 New Folder`|Create a new folder in the current pane.
`F8 Delete`|Delete the selected files in the current pane.
`F9 Focus`|Toggle focus between the panel and the editor.
`F10 Hide`|Toggle visibility.

## Alternative Buttons
Hold down `Shift` to see the alternative buttons.

Button|Action
---|---
`Shift-F3 Remove Project`|Remove the highlighted or selected project folders from the workspace. If a folder isn't highlighted nor any folders selected then the folder currently being shown will be removed.
`Shift-F5 Duplicate`|Duplicate the highlighted file or folder.

## Keys
Use the arrow keys, page-up, page-down, home and end to navigate.

The following are special keys:

Key|Action
---|---
`Alt`|Open the quick menu.
`Shift`|Show alternative buttons.
`Left`|Highlight the first item.
`Right`|Highlight the last item.
`Space`|Select the highlighted item.
`Backspace`|Navigate to the parent folder.
`Tab`|Switch to the other pane.
`Ctrl-Tab`|Show the same folder in the other pane.
`Enter`|Open highlighted item. If it's a file then it will be opened in the editor.
`Ctrl-Enter` `Cmd-Enter`|Open highlighted item with OS's default application. If it's a folder then it will be shown in the OS's file manager.
`Ctrl-T` `Cmd-T`|Open highlighted item in a new tab.
`Ctrl-R` `Cmd-R`|Remove current tab.
`Ctrl-Left` `Cmd-Left|Select previous tab.
`Ctrl-Right` `Cmd-Right`|Select next tab.
`Ctrl-Shift-Left` `Cmd-Shift-Left`|Shift current tab left.
`Ctrl-Shift-Right` `Cmd-Shift-Right`|Shift current tab right.
`+`|Open dialog to add items to selection.
`-`|Open dialog to remove items from selection.
`*`|Invert selection.

## Search
A file or folder can be quickly found by simply starting to type parts of its name. The one that matches the input the best will be highlighted.

![Screenshot](https://github.com/morassman/atom-commander/blob/master/resources/search.png?raw=true)

## Menus
There are two types of menus available: A context menu and a quick menu.

### Context Menu
The context menu can be opened from anywhere on the panel.

![Screenshot](https://github.com/morassman/atom-commander/blob/master/resources/context_menu.png?raw=true)

### Quick Menu
The menu is opened by holding down the `Alt` key. Releasing the key will close the menu again.

![Screenshot](https://github.com/morassman/atom-commander/blob/master/resources/quick_menu.png?raw=true)

The menus are shown at the top of the panel in the form of buttons. Each button is numbered. Pressing the corresponding number will open that menu. Since these are buttons they can be clicked on as well.

Entering a menu will show its items and potential sub menus. These are also numbered. There is also an extra button on the left to return to the parent menu. The keys `0`, `Escape` and `Shift` are all valid keys for returning to the parent menu.

When the menu is closed and opened again it will start on the root menu.

### Available Menus
1. **Select**
  1. **All** : Select everything.
  2. **None** : Deselect everything.
  3. **Add** : Select items with a pattern.
  4. **Remove** : Deselect items with a pattern.
  5. **Invert** : Invert the selection.
  6. **Folders** : Add folders to selection.
  7. **Files** : Add files to selection.
2. **Go**
  1. **Project** : Go to the project folder.
  2. **Editor** : Go to the file that is active in the editor.
  3. **Drive** : Go to a specific drive.
  4. **Root** : Go to the root folder.
  5. **Home** : Go to your user folder.
3. **Bookmarks**
  1. **Add** : Add a bookmark.
  2. **Remove** : Remove bookmarks.
  3. **Open** : Open a bookmark.
4. **Servers**
  1. **Add** : Add an FTP or SFTP server.
  2. **Remove** : Remove a server.
  3. **Open** : Open the initial folder of a server.
  4. **Close** : Close the connection to a server.
  5. **Cache** : View and sync the cache associated with a server.
5. **Open**
  1. **Terminal** : Open a terminal in the current folder.
  2. **File Manager** : Show the highlighted item in the OS's file manager.
  3. **System** : Open highlighted item with OS's default application. If it's a folder then it will be shown in the OS's file manager.
6. **View**
  1. **Refresh** : Reloads the content of the current folder. Local folders automatically refresh, but remote folders do not.
  2. **Mirror** : Show the same folder in the other pane as the focused one.
  3. **Swap** : Swap the two folders.
7. **Compare**
  1. **Folders** : Select the differences between the two folders.
  2. **Files** : Show the difference between the left and right highlighted files.

## Bookmarks
Bookmarks allow for quick navigation to both files and folders.

### Adding Bookmarks
Bookmarks can be added from either the menu in Atom Commander or by choosing `Atom Commander: Add Bookmark` from the Command Palette. If the menu is used then the a bookmark will be added for the item that is currently highlighted. If the Command Palette is used and the editor has focus then a bookmark will be added for the file currently being edited.

When a bookmark is added a name for it can be entered. This is optional and may be left empty.

### Opening Bookmarks
The list of bookmarks can be opened from either the menu in Atom Commander or by choosing `Atom Commander: Open Bookmark` from the Command Palette. The list can be filtered on both the name and path. When a bookmark for a file is opened the file will be opened in the editor and it will be shown in Atom Commander. If the bookmark is for a folder then the folder will be shown.

### Removing Bookmarks
The list of bookmarks can be opened from either the menu in Atom Commander or by choosing `Atom Commander: Remove Bookmark` from the Command Palette. Each bookmark that is selected will be removed. The list will remain open until it is cancelled by pressing the `Escape` key.

## Folder Tabs
Multiple folder tabs can be added to each of the panels.

![Screenshot](https://github.com/morassman/atom-commander/blob/master/resources/tabs.png?raw=true)

### Adding Tabs
A new tab can be added by pressing `Ctrl-T` or `Cmd-T`. If a folder is highlighted then that folder will be opened in the new tab. Otherwise the current folder will be opened instead.

### Removing Tabs
The current tab can be removed by pressing `Ctrl-R` or `Cmd-R`.

### Navigating Tabs
The previous tab can be selected by pressing `Ctrl-Left` or `Cmd-Left` whereas the next tab is selected with `Ctrl-Right` or `Cmd-Right`.

### Sorting Tabs
Pressing `Ctrl-Shift-Left` or `Cmd-Shift-Left` will shift the current tab to the left whereas `Ctrl-Shift-Right` or `Cmd-Shift-Right` will shift it to the right. If the end is reached the tab will wrap to the other side.

## Servers
Files can be accessed remotely via FTP and SFTP.

### Adding Servers
Servers can be added by choosing `Add` from the `Servers` menu or `Atom Commander: Add Server` from the Command Palette.

![Screenshot](https://github.com/morassman/atom-commander/blob/master/resources/add_server.png?raw=true)

If `Remember Password` is checked then the password will be persisted along with the username. A weak encryption will be applied to the password.

It is advisable to test the connection before accepting the configuration to ensure that everything is correct.

### Removing Servers
Servers can be removed by choosing `Remove` from the `Servers` menu or `Atom Commander: Remove Server` from the Command Palette. When a server is removed all the bookmarks associated with it are removed as well. The cache is also cleared and any file transfers will be stopped. You will, however, be prompted if files are still in the cache or being transferred.

### Cache
All remote files that are viewed or edited are cached on the local file system. Each server has its own cache associated with it. The cache for a server can be viewed by choosing `Cache` from the `Servers` menu or `Atom Commander: Open Cache` from the Command Palette.

Doing so will open a view that lists all the files in the cache. From here files can be uploaded, downloaded, compared and removed.

![Screenshot](https://github.com/morassman/atom-commander/blob/master/resources/cache.png?raw=true)

Button|Description
---|---
Open|Opens the cached file.
Compare|Compares the cached file side-by-side with the one on the server.
Upload|Uploads the cached file to the server.
Download|Replaces the cached file with the one on the server.
Remove|Removes the file from the cache.

Multiple files can be uploaded, downloaded or removed by using the buttons at the top.

The list doesn't automatically update when files are added to the cache, but the `Refresh` button can be pressed to repopulate the list.

### Settings

The following settings are applicable to cached files:

![Screenshot](https://github.com/morassman/atom-commander/blob/master/resources/settings.png?raw=true)

#### Remove On Close
If this is selected then files will be removed from the cache when the file is closed. If the file was modified, but not uploaded then it will **not** be removed. This will be the case either if the upload failed or if `Upload On Save` is not selected. This is to ensure that changes are not lost. This is enabled by default.

#### Upload On Save
If this is selected then files will be automatically uploaded to the server when they are saved. This is enabled by default. The file will remain in the cache if it couldn't be uploaded.

### Editing Remote Files
If the `Upload On Save` setting is enabled then the file will automatically be uploaded each time it is saved. However, if it isn't enabled, then one will need to upload cached files via the cache view. A quick way to upload the file currently being edited is to select `Atom Commander: Upload File` from the Command Palette. Doing so copies the cached file to the server. The file is therefore first saved to the cache before it is uploaded.

Similarly one can download the file from the server by choosing `Atom Commander: Download File` from the Command Palette. This replaces the cached file with the one that was downloaded.

It is also possible to quickly compare the file being edited with the one on the server by choosing `Atom Commander: Compare With Server`. This operation doesn't require the cached file to be saved first. The content of the editor is used directly.

## Compare
### Folders
When the left and right folders are compared then everything that is in the one, but not in the other will be selected. This will replace the current selection.
### Files
Performing this action will open a side-by-side view that will compare the file highlighted on the left with the one highlighted on the right.

![Screenshot](https://github.com/morassman/atom-commander/blob/master/resources/diff.png?raw=true)

Lines that have been added are highlighted on the left whereas lines that have been removed are highlighted on the right. The remaining lines are those that the files have in common. Clicking on a common section will highlight it and its counterpart on the other side.

The files are currently not being monitored for changes. If either of the files change then the comparison will have to be done again.

## Columns
The size and modified date columns can be toggled from the context menu.

![Screenshot](https://github.com/morassman/atom-commander/blob/master/resources/columns.png?raw=true)

## Todo
- Visual feedback for file system operations.
