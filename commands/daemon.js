var Command = require('ronin').Command
var mirror = require('./../src')
var path = require('path')

module.exports = Command.extend({
  desc: 'Mirror npm registry',

  options: {
    folder: {
      type: 'string',
      default: path.join(process.cwd(), 'registry')
    },
    'blob-store': {
      type: 'string'
    },
    clone: {
      type: 'boolean',
      default: false
    },
    ipfs: {
      type: 'boolean',
      default: false
    }
  },

  run: function (folder, blobStore, clone, ipfs, name) {
    if (ipfs) {
      console.log('ipfs mode on')
      blobStore = path.resolve(__dirname, '../src/ibs.js')
      folder = 'registry'
      console.log(blobStore)
    }
    mirror(folder, blobStore, clone)
  }
})
