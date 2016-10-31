'use strict'

const async = require('async')
const npmIPFS = require('../../../../ipfs-npm')

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
    async.waterfall([
      (cb) => npmIPFS.ipfs({url: argv.ipfs}, cb),
      (ipfs, cb) => npmIPFS.registry.index.publish(ipfs, cb)
    ], (err, res) => {
      if (err) {
        console.error('Failed to publish to IPNS: %s', err)
        process.exit(1)
      }

      console.log('Published:')
      console.log('\tIPNS: /ipns/%s', res.Name)
      console.log('\tIPFS: %s', res.Value)
    })
  }
}
