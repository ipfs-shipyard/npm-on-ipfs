'use strict'

// const async = require('async')
// const npmIPFS = require('./../../ipfs-npm')
// const config = npmIPFS.config
// const log = config.log

module.exports = {
  id: 'fetch',

  describe: 'update your npm list of modules from IPNS',

  builder: {
    name: {
      type: 'string'
    }
  },

  handler (name) {
    throw new Error('Not implemented yet')
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
}
