const Command = require('ronin').Command
// const npmIPFS = require('./../../../ipfs-npm')
// const config = npmIPFS.config
// const log = config.log

module.exports = Command.extend({
  desc: 'Publish an IPNS record with your current npm list',

  options: {},

  run: function () {
    console.log('Not Implemented yet')
    // npmIPFS.registryCache.publish()
  }
})
