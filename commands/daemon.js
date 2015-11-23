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
    },
    port: {
      type: 'number'
    },
    host: {
      type: 'string',
      default: 'localhost'
    }
  },

  run: function (folder, blobStore, clone, ipfs, port, host, name) {
    if (ipfs) {
      console.log('IPFS mode ON')
      blobStore = path.resolve(__dirname, '../src/ibs.js')
      folder = '/npm-registry/'
    }
    mirror({
      outputDir: folder,
      blobStore: blobStore,
      clone: clone,
      ipfs: ipfs,
      port: port,
      host: host
    })
  }
})
