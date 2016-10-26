'use strict'

// const npmIPFS = require('./../../ipfs-npm')
// const config = npmIPFS.config
// const log = config.log

module.exports = {
  id: 'daemon',

  describe: 'create a registry endpoint for the npm cli to interact with',

  builder: {
    port: {
      type: 'number'
    },
    host: {
      type: 'string',
      default: 'localhost'
    }
  },

  handler (argv) {
    throw new Error('Not implemented yet')
    /*
    if (port) {
      config.mirror.port = port
    }
    if (host) {
      config.mirror.host = host
    }
    npmIPFS.mirror((err) => {
      if (err) {
        throw err
      }
      console.log('ipnpm daemon running on:', config.mirror.host, config.mirror.port)
    })
    */
  }
}
