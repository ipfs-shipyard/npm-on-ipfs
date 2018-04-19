'use strict'

// const npmIPFS = require('./../../ipfs-npm')
// const config = npmIPFS.config
// const log = config.log

module.exports = {
  id: 'install',

  describe: 'install a package from ipnpm.',

  builder: {
    ipfs: {
      describe: 'Select an IPFS daemon, e.g. /ip4/127.0.0.1/tcp/5001',
      type: 'string'
    }
  },

  handler (argv) {
    throw new Error('Not implemented yet')
  }
}
