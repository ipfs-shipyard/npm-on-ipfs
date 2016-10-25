'use strict'

// const async = require('async')
const Command = require('ronin').Command
// const npmIPFS = require('./../../../ipfs-npm')
// const config = npmIPFS.config
// const log = config.log

module.exports = Command.extend({
  desc: 'Check modules available in the mirror',

  options: {
    update: {
      type: 'boolean',
      alias: 'u',
      default: false
    }
  },

  run: function (update) {
    console.log('not implemented yet')
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
})
