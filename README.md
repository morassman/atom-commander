# Atom Commander

Dual-pane file manager for Atom.

**Note : **This is not meant to replace the tree view nor to be a full featured file manager. More features will be added in time, but the primary focus is to provide a way to browse the file system in a way that's familiar to many people.

![Screenshot](https://github.com/morassman/atom-commander/blob/master/resources/panel.png?raw=true)

## Buttons
Button|Action
---|---
F3 Add Project|Adds the directory of the selected pane as a project folder to the workspace.
F4 New File|Creates a new file in the selected pane's directory and opens it for editing.
F5 Copy|Copy the selected files to the other pane.
F6 Move|Move the selected files to the other pane.
F7 Make Dir|Creates a new directory in the current pane.
F8 Delete|Deletes the selected files in the current pane.
F9 Hide|Hides and shows the panel.

## Keys
Use the arrow keys, page-up, page-down, home and end to navigate.

The following are special keys:

Key|Action
---|---
Enter|Open highlighted item. If it's a file then it will be opened in the editor.
Backspace|Navigate to the parent directory.
Left|Highlight the first item.
Right|Highlight the last item.
Tab|Switch to the other pane.

## Next Up
- Make the panel resizable.
- Allow files and directories to be selected.
- Implement the rest of the buttons:
 - New File
 - Copy
 - Move
 - Make Dir
 - Delete
