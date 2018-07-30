'use strict'

const fs = require('fs-extra')
const timethat = require('timethat').calc
const log = require('debug')('ipfs:registry-mirror')

module.exports = function clean (options) {
  if (!options.clean) {
    return Promise.resolve()
  }

  var start = new Date()

  log('Deleting', options.seqFile)

  return fs.unlink(options.seqFile)
    .then(() => {
      log('Finished cleaning in', timethat(start))
    })
}
