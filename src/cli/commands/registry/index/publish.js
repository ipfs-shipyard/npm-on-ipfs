'use strict'

// const npmIPFS = require('./../../../ipfs-npm')
// const config = npmIPFS.config
// const log = config.log

module.exports = {
  id: 'publish',

  describe: 'publish an IPNS record with your current npm list',

  builder: {
    ipfs: {
      describe: 'Select an IPFS daemon, e.g. /ip4/127.0.0.1/tcp/5001',
      type: 'string'
    }
  },

  handler (argv) {
    throw new Error('Not Implemented yet')
    // npmIPFS.registryCache.publish()
  }
}
