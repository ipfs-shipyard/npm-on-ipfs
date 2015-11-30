var Command = require('ronin').Command
var fetchIPNS = require('../src/fetch-ipns')
var ipfsAPI = require('ipfs-api')
var logger = require('../src/logger')

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
      fetchIPNS({ blobStore: true }, function () {
        ls()
      })
    } else {
      ls()
    }

    function ls () {
      var apiCtl = ipfsAPI('/ip4/127.0.0.1/tcp/5001')
      apiCtl.files.ls('/npm-registry', function (err, res) {
        if (err) {
          return logger.err(err)
        }
        res.Entries.forEach(function (module) {
          console.log(module.Name, '\t', module.Hash)
        })
      })
    }
  }
})
