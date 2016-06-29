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
    'ipfs': {
      type: 'string'
    },
    'log-level': {
      type: 'string'
    }
  },

  run: function (seqNumber, ipfsApiUrl, logLevel) {
    const ipfs = npmIPFS.ipfs()
    npmIPFS.registry.clone(ipfs)
  }
})
