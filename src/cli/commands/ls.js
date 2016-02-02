var Command = require('ronin').Command
var rm = require('./../../index.js')
var async = require('async')
var debug = require('debug')
var log = debug('registry-mirror')
log.err = debug('registry-mirror:error')

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
    const series = []
    if (update) {
      series.push(rm.registryCache.connect)
      series.push(rm.registryCache.cacheRegistry)
    }
    series.push(rm.ls)

    async.series(series, (err, results) => {
      if (err) { return console.log(err) }

      results[0].Entries.forEach((module) => {
        console.log(module.Name, '\t', module.Hash)
      })

      console.log('Updated registry cache to:', results[1])
    })
  }
})
