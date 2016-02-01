var Command = require('ronin').Command
var fetchIPNS = require('../../../index.js').registryCache
var ipfsAPI = require('ipfs-api')
var debug = require('debug')
var log = debug('registry-mirror')
log.err = debug('registry-mirror:error')

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
        console.log(err)
        return log.err('Failed: ', err)
      }
      console.log('updated local registry list copy to:', res)
    }
  }
})
