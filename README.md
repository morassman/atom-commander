# Atom Commander

Dual-pane file manager for Atom.

This is not meant to replace the tree view nor to be a full featured file manager. More features will be added in time, but the primary focus is to provide a way to browse the file system in a way that's familiar to many people.

After installing Atom Commander, press `F9` or choose `Atom Commander: Toggle` from the Command Palette to open the panel.

![Screenshot](https://github.com/morassman/atom-commander/blob/master/resources/panel.png?raw=true)

## Buttons
Button|Action
---|---
F3 Add Project|Adds the folder of the selected pane as a project folder to the workspace.
F4 New File|Creates a new file in the selected pane's folder and opens it for editing.
F5 Copy|Copy the selected files to the other pane.
F6 Move|Move the selected files to the other pane.
F7 New Folder|Creates a new folder in the current pane.
F8 Delete|Deletes the selected files in the current pane.
F9 Hide|Hides and shows the panel.

## Keys
Use the arrow keys, page-up, page-down, home and end to navigate.

The following are special keys:

Key|Action
---|---
Enter|Open highlighted item. If it's a file then it will be opened in the editor.
Backspace|Navigate to the parent folder.
Left|Highlight the first item.
Right|Highlight the last item.
Tab|Switch to the other pane.

## Next Up
- Make the panel resizable.
- Load directories asynchronously.
- Add proper error handling for file system errors.
- Implement the rest of the buttons:
 - Copy
 - Move
 - Delete
