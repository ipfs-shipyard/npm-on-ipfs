var Command = require('ronin').Command
var fetchIPNS = require('../../index.js').registryCache
var ipfsAPI = require('ipfs-api')
var debug = require('debug')
var log = debug('registry-mirror')
log.err = debug('registry-mirror:error')

module.exports = Command.extend({
  desc: 'Check modules available in the mirror',

  options: {
    update: {
      type: 'boolean',
      alias: 'u',
      default: false
    }
  },

  run: function (update, name) {
    if (update) {
      fetchIPNS({ blobStore: true }, function (err) {
        if (err) {
          log.err('Failed to update /npm-registry mDAG node', err)
        }
        ls()
      })
    } else {
      ls()
    }
  }
})

function ls () {
  var apiCtl = ipfsAPI('/ip4/127.0.0.1/tcp/5001')
  apiCtl.files.ls('/npm-registry', function (err, res) {
    if (err) {
      return log.err(err)
    }
    res.Entries.forEach(function (module) {
      console.log(module.Name, '\t', module.Hash)
    })
  })
}

