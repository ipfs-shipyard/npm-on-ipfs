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
      console.log('IPFS mode ON')
      blobStore = path.resolve(__dirname, '../src/ibs.js')
      folder = '/npm-registry/'
    }
    mirror(folder, blobStore, clone, ipfs)
  }
})
