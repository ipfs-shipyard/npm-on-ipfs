'use strict'

// const async = require('async')
const Command = require('ronin').Command
const npmIPFS = require('./../../../ipfs-npm')
// const config = npmIPFS.config
// const log = config.log

module.exports = Command.extend({
  desc: 'Check modules available in the mirror',

  options: {
    'set-number': {
      type: 'number',
      default: undefined
    },
    ipfs: {
      type: 'string'
    },
    'log-level': {
      type: 'string'
    },
    flush: {
      type: 'boolean',
      default: true
    }
  },

  run: function (seqNumber, ipfsApiUrl, logLevel, flush) {
    const ipfs = npmIPFS.ipfs({url: ipfsApiUrl})
    npmIPFS.registry.clone(ipfs, {
      seqNumber: seqNumber,
      flush: flush,
      url: ipfsApiUrl
    })
  }
})
