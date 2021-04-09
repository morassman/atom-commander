import { main } from './main'

const config = {
  panel: {
    type: 'object',
    properties: {
      showInDock: {
        title: 'Show In Dock',
        description: 'Show the panel in the dock. Disable to limit the panel to the bottom of the screen.',
        type: 'boolean',
        default: true,
        order: 1
      },
      onlyOneWhenVertical: {
        title: 'Single Browser When Docked Left Or Right',
        description: 'Show only one browser at a time when the panel is docked on the left or right. Tabbing will toggle between them.',
        type: 'boolean',
        default: false,
        order: 2
      },
      hideOnOpen: {
        title: 'Hide After Opening File',
        description: 'Hide the panel after opening a file and then focus the editor.',
        type: 'boolean',
        default: false,
        order: 3
      }
    }
  },
  menu: {
    type: 'object',
    properties: {
      showMenuDetails: {
        title: 'Show Menu Details',
        description: 'Show the details of all menus under the menu bar.',
        type: 'boolean',
        default: true
      }
    }
  },
  uploadOnSave: {
    title: 'Upload Cached File On Save',
    description: 'Automatically upload cached files when saved.',
    type: 'boolean',
    default: true
  },
  removeOnClose: {
    title: 'Remove Cached File On Close',
    description: 'Remove a cached file after it was closed and successfully uploaded.',
    type: 'boolean',
    default: true
  }
}

module.exports = {

  config,

  activate(state: any) {
    main.activate(state)
  },

  deactivate() {
    main.deactivate()
  },

  serialize() {
    return main.serialize()
  },

  consumeStatusBar(statusBar: any) {
    main.consumeStatusBar(statusBar)
  }

}