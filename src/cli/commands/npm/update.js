var Command = require('ronin').Command
var fetchIPNS = require('../../../fetch-ipns')
var logger = require('../../../logger')
var ipfsAPI = require('ipfs-api')

module.exports = Command.extend({
  desc: 'Update your npm list of modules from IPNS',

  options: {
    ipns: {
      type: 'string'
    }
  },

  run: function (ipns, name) {
    if (ipns) {
      var ctl = ipfsAPI('/ip4/127.0.0.1/tcp/5001')
      fetchIPNS.copyNpmRegistry(ctl, ipns, result)
    } else {
      fetchIPNS({
        blobStore: true // so that it knows it has to copy
      }, result)
    }
    function result (err, res) {
      if (err) {
        return logger.error('Failed: ', err)
      }
      logger.info('Updated local registry list copy:', res)
    }
  }
})
