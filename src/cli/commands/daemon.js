var Command = require('ronin').Command
var mirror = require('./../../')
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
    port: {
      type: 'number'
    },
    host: {
      type: 'string',
      default: 'localhost'
    }
  },

  run: function (folder, blobStore, clone, port, host, name) {
    blobStore = path.resolve(__dirname, '../../ibs.js')

    mirror({
      outputDir: '/npm-registry/',
      blobStore: blobStore,
      clone: clone,
      port: port,
      host: host
    })
  }
})
