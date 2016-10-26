'use strict'

const npmIPFS = require('../../ipfs-npm')
// const config = npmIPFS.config
// const log = config.log

module.exports = {
  id: 'daemon',

  describe: 'create a registry endpoint for the npm cli to interact with',

  builder: {
    port: {
      desc: 'Port the server should run on',
      type: 'number',
      default: 5001
    },
    host: {
      desc: 'Port the server should run on',
      type: 'string',
      default: 'localhost'
    }
  },

  handler (argv) {
    npmIPFS.daemon({
      port: argv.port,
      host: argv.host
    }, (err, res) => {
      if (err) {
        throw err
      }

      console.log('damon is running')
      console.log('use npm with --registry=http://' + res.address + ':' + res.port)
    })
  }
}
