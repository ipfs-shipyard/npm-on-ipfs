var Command = require('ronin').Command
var mirror = require('./../src')
var path = require('path')

module.exports = Command.extend({
  desc: 'Mirror npm registry',

  options: {
    folder: {
      type: 'string',
      default: path.join(process.cwd(), 'registry-mirror')
    },
    'blob-store': {
      type: 'string'
    },
    clone: {
      type: 'boolean',
      default: false
    }
  },

  run: function (folder, blobStore, clone, name) {
    mirror(folder, blobStore, clone)
  }
})
