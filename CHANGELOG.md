## 0.8.7 - 18 February 2017
- Added guard to handle files that do not exist anymore.

## 0.8.6 - 15 January 2017
- Added ability to edit FTP and SFTP settings.
- Improved error handling when testing SFTP settings.
- Changed tab's tooltip to show full paths of files being compared.
- Use latest API when adding a pane item.

## 0.8.5 - 17 December 2016
- Added bookmarks to context menu.
- Changed SSH2 dependency to latest version.
- Added item name to delete prompt.

## 0.8.4 - 16 November 2016
- Added refresh to context menu.
- Improved error handling when creating files.
- Added duplicate name checking when creating a file.
- Fixed restoring of current folder after loading.
- Fixed selection of diffs in diff viewer.
- Fixed opening local cache from context menu.
- Fixed null dereference in FTP dialog.

## 0.8.3 - 6 October 2016
* Fixed SFTP login when password is not stored.

## 0.8.0 - 25 September 2016
* Added SFTP SSH key login.
* Fixed layout in FTP modal.
* Auto show panel when navigating from command palette.
* Added username indicator when selecting a remote file system.

## 0.7.3 - 18 September 2016
* Fixed bug in new folder modal.

## 0.7.2 - 17 September 2016
* Fixed file separator used for remote paths.
* Fixed alternate button behaviour when clicking on button.

## 0.7.1 - 27 August 2016
* Added ability to toggle extension column.
* Added setting to hide panel after opening a file.
* Added username indicator when browsing a remote file system.

## 0.6.1 - 27 February 2016
* Added support for SFTP symbolic links.
* Fixed the way FTP folder symbolic links are determined.

## 0.6.0 - 16 January 2016
* Added alternative buttons when holding down shift key.
* Added ability to remove projects: Shift-F3
* Added ability to duplicate files and folders: Shift-F5

## 0.5.1 - 26 December 2015
* Fixed selecting of marker in diff view.
* Small UI touch-ups.

## 0.5.0 - 30 October 2015
* Added folder tabs.

## 0.4.2 - 15 October 2015
* Fixed the format of paths in the cache when using Windows.

## 0.4.0 - 12 October 2015
* Added FTP and SFTP support.
* Added 'Open' menu with options:
  * Terminal : Open terminal in current folder.
  * File Manager : Open highlighted item in OS's file manager.
  * System : Open highlighted item with OS's default application.

## 0.3.5 - 7 September 2015
* Fixed bug that prevented panel from hiding.
* Improved event handling on Linux when showing menu.

## 0.3.4 - 2 September 2015
* Changed persistence of state to be stored to a file.

## 0.3.3 - 30 August 2015
* Added 'Files' option to 'Compare' menu.

## 0.3.2 - 30 August 2015
* Added support for bookmarks.
* Added option to navigate to drives.
* Added option to navigate to project folders.

## 0.3.1 - 29 August 2015
* Added `+`, `-` and `*` selection shortcut keys.
* Added search functionality. Start typing and the best match will be highlighted.
* Added 'Editor' option to 'Go' menu. This will go to the file that is active in the editor.

## 0.3.0 - 25 August 2015
* Added more select options: Add, Remove, Folders, Files.
* Added 'Go' menu with options: Root, Home
* Added 'View' menu with options: Mirror, Swap
* Changed F9 shortcut to toggle focus.
* Added F10 shortcut to toggle visibility.
* Fixed a bug that incorrectly made it look like the pane has focus.

## 0.2.11 - 23 August 2015
* Added ability to rename files and folders.
* Changed highlight to indicate whether the pane has focus.

## 0.2.8 - 22 August 2015
* Added compare folders function.
* Added select all, none and invert function.
* Added menu bar and context menu.

## 0.2.7 - 21 August 2015
* Added ability to resize the panel.
* Added callback to unselect items that have finished copying.
* Added the open folders, visibility and size to package state.
* Changed the 'F3 Add Project' behavior to add folders that are selected.

## 0.2.6 - 20 August 2015
* Implemented copy, move and delete functionality.
* Fixed unwanted scrolling when selecting an item.
* Added Ctrl-Tab functionality to mirror the panes.

## 0.2.5 - 19 August 2015
* Added ability to select files and directories.
* Added ability to create new files and directories.
* Improved refreshing of directory so that highlight persists.

## 0.1.0 - 18 August 2015
* Added basic dual pane functionality and navigation.
