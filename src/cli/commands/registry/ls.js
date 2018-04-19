'use strict'

const async = require('async')
const npmIPFS = require('./../../../ipfs-npm')

module.exports = {
  id: 'ls',

  describe: 'list modules available in the mirror',

  builder: {
    ipfs: {
      describe: 'Select an IPFS daemon, e.g. /ip4/127.0.0.1/tcp/5001',
      type: 'string'
    }
  },

  handler (argv) {
    if (argv.update) {
      throw new Error('not implemented yet')
    }

    async.waterfall([
      (cb) => npmIPFS.ipfs({url: argv.ipfs}, cb),
      (ipfs, cb) => npmIPFS.registry.ls(ipfs, cb)
    ], (err, res) => {
      if (err) {
        console.error(err.message)
        process.exit(1)
      }

      res.Entries.forEach((module) => {
        console.log(`${module.Name}\t${module.Hash}`)
      })
    })
    /*
    const series = []
    if (update) {
      series.push(npmIPFS.registryCache.connect)
      series.push(npmIPFS.registryCache.cacheRegistry)
    }
    series.push(npmIPFS.ls)

    async.series(series, (err, results) => {
      if (err) {
        throw err
      }

      results[0].Entries.forEach((module) => {
        console.log(module.Name, '\t', module.Hash)
      })

      console.log('Updated registry cache to:', results[1])
    })
    */
  }
}
