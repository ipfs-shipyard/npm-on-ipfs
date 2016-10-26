'use strict'

const async = require('async')
const npmIPFS = require('../../../../ipfs-npm')

module.exports = {
  id: 'fetch',

  describe: 'update your npm list of modules from IPNS',

  builder: {
    ame: {
      type: 'string'
    }
  },

  handler (argv) {
    npmIPFS.ipfs({url: argv.ipfs}, (err, ipfs) => {
      if (err) {
        throw err
      }

      async.series([
        (cb) => npmIPFS.registry.index.connect(ipfs, cb),
        (cb) => npmIPFS.registry.index.cacheRegistry(ipfs, cb)
      ], (err, results) => {
        if (err) {
          throw err
        }

        console.log('Updated registry cache to:', results[1])
      })
    })
  }
}
