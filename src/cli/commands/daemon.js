var Command = require('ronin').Command
var regmirror = require('./../../index.js')
var async = require('async')

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
    if (clone) {
      regmirror.clone()
    }

    async.series([
      regmirror.registryCache.connect,
      regmirror.registryCache.cacheRegistry
    ], (err, results) => {
      if (err) {
        return console.log(err)
      }
      console.log('latest registry ->', results[1])
    })
  }
})
