# Atom Commander

Dual-pane file manager for Atom.

This is not meant to replace the tree view nor to be a full featured file manager. More features will be added in time, but the primary focus is to provide a way to browse the file system in a way that's familiar to many people.

After installing Atom Commander, press `F9` or choose `Atom Commander: Toggle Focus` from the Command Palette to show the panel and focus it. The panel can be hidden with `F10` or `Atom Commander: Toggle Visible`.

![Screenshot](https://github.com/morassman/atom-commander/blob/master/resources/panel.png?raw=true)

## Buttons
Button|Action
---|---
F2 Rename|Rename the highlighted file or folder.
F3 Add Project|Add the highlighted or selected folders as project folders to the workspace. If a folder isn't highlighted nor any folders selected then the folder currently being shown will be added.
F4 New File|Create a new file in the selected pane's folder and opens it for editing.
F5 Copy|Copy the selected files to the other pane.
F6 Move|Move the selected files to the other pane.
F7 New Folder|Create a new folder in the current pane.
F8 Delete|Delete the selected files in the current pane.
F9 Focus|Toggle focus between the panel and the editor.
F10 Hide|Toggle visibility.

## Keys
Use the arrow keys, page-up, page-down, home and end to navigate.

The following are special keys:

Key|Action
---|---
Enter|Open highlighted item. If it's a file then it will be opened in the editor.
Backspace|Navigate to the parent folder.
Left|Highlight the first item.
Right|Highlight the last item.
Space|Select the highlighted item.
Tab|Switch to the other pane.
Ctrl-Tab|Show the same folder in the other pane.
Alt|Open the quick menu.

## Menus
There are two types of menus available: A context menu and a quick menu.

### Context Menu
The context menu can be opened from anywhere on the panel.

![Screenshot](https://github.com/morassman/atom-commander/blob/master/resources/context_menu.png?raw=true)

### Quick Menu
This is still experimental. The purpose is to quickly navigate the menus without using the mouse.

The menu is opened by holding down the `Alt` key. Releasing the key will close the menu again.

![Screenshot](https://github.com/morassman/atom-commander/blob/master/resources/quick_menu_1.png?raw=true)

The menus are shown at the top of the panel in the form of buttons. Each button is numbered. Pressing the corresponding number will open that menu. Since these are buttons they can be clicked on as well.

Entering a menu will show its items and potential sub menus. These are also numbered. There will also be an extra button on the left to return to the parent menu. The keys `0`, `Escape` and `Shift` are all valid keys for returning to the parent menu.

![Screenshot](https://github.com/morassman/atom-commander/blob/master/resources/quick_menu_2.png?raw=true)

When the menu is closed and opened again it will start on the root menu.

### Available Menus
- Select
  - All : Select everything.
  - None : Deselect everything.
- Go
  - Root : Go to the root folder in the focused pane.
  - Home : Go to your user folder in the focused pane.
- View
  - Mirror : Show the same folder in the other pane as the focused one.
  - Swap : Swap the two folders.
- Compare
  - Folders : Select the differences between the two folders.

## Next Up
- Load directories asynchronously.
- Provide feedback for copy, move and delete.
- Add proper error handling for file system errors.
