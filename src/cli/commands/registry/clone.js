'use strict'

// const async = require('async')
const npmIPFS = require('./../../../ipfs-npm')
// const config = npmIPFS.config
// const log = config.log

module.exports = {
  id: 'clone',

  describe: 'copy all available modules from the registry into the mirror',

  builder: {
    'set-number': {
      describe: 'Select the mirror sequence number to start from',
      type: 'number'
    },
    ipfs: {
      describe: 'Select an IPFS daemon, e.g. /ip4/127.0.0.1/tcp/5001',
      type: 'string'
    },
    'log-level': {
      describe: 'Set the log level',
      type: 'string',
      choices: ['all', 'module']
    },
    flush: {
      describe: 'Write the modules to disk as soon as they are written into IPFS',
      type: 'boolean',
      default: true
    }
  },

  handler (argv) {
    const ipfs = npmIPFS.ipfs({url: argv.ipfs})
    npmIPFS.registry.clone(ipfs, {
      seqNumber: argv['set-number'],
      flush: argv.flush,
      url: argv.ipfs
    })
  }
}
