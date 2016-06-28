const Command = require('ronin').Command
// const npmIPFS = require('./../../ipfs-npm')
// const config = npmIPFS.config
// const log = config.log

module.exports = Command.extend({
  desc: 'creates a registry endpoint for the npm cli to interact with',

  options: {
    port: {
      type: 'number'
    },
    host: {
      type: 'string',
      default: 'localhost'
    }
  },

  run: function (port, host, logRoot) {
    console.log('Not implemented yet')
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
})
