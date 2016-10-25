'use strict'

// const async = require('async')
const Command = require('ronin').Command
// const npmIPFS = require('./../../ipfs-npm')
// const config = npmIPFS.config
// const log = config.log

module.exports = Command.extend({
  desc: 'Update your npm list of modules from IPNS',

  options: {
    name: {
      type: 'string'
    }
  },

  run: function (name) {
    console.log('Not implemented yet')
    /*
    async.series([
      npmIPFS.registryCache.connect,
      npmIPFS.registryCache.cacheRegistry
    ], (err, results) => {
      if (err) {
        throw err
      }
      console.log('Updated registry cache to:', results[1])
    })
    */
  }
})
