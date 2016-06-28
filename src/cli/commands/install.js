const Command = require('ronin').Command
// const npmIPFS = require('./../../ipfs-npm')
// const config = npmIPFS.config
// const log = config.log

module.exports = Command.extend({
  desc: 'install a package from ipnpm. Fallsback to npm regular registry if the module is not found',

  options: {
  },

  run: () => {
    console.log('Not implemented yet')
  }
})
