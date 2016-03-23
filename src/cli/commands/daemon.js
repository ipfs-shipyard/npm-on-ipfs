var Command = require('ronin').Command
var rm = require('./../../index.js')
var async = require('async')
var config = require('./../../config.js')

module.exports = Command.extend({
  desc: 'Mirror npm registry',

  options: {
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
    },
    'log-root': {
      type: 'string'
    }
  },

  run: function (clone, port, host, logRoot) {
    async.series([
      rm.registryCache.connect,
      rm.registryCache.cacheRegistry,
      (callback) => {
        if (clone) {
          rm.clone()
        }
        callback()
      },
      (callback) => {
        if (port) { config.mirror.port = port }
        if (host) { config.mirror.host = host }
        rm.mirror(callback)
      },
      (callback) => {
        // TODO logRoot
        callback()
      }
    ], (err, results) => {
      if (err) { return console.log(err) }
      console.log('Updated registry cache to:', results[1])
    })
  }
})
