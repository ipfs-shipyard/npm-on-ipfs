'use strict'

var Command = require('ronin').Command
var rm = require('../../../index.js')
var async = require('async')
var debug = require('debug')
var log = debug('registry-mirror')
log.err = debug('registry-mirror:error')

module.exports = Command.extend({
  desc: 'Update your npm list of modules from IPNS',

  options: {
    ipns: {
      type: 'string'
    }
  },

  run: function (ipns, name) {
    async.series([
      rm.registryCache.connect,
      rm.registryCache.cacheRegistry
    ], (err, results) => {
      if (err) {
        return console.log(err)
      }
      console.log('Updated registry cache to:', results[1])
    })
  }
})
