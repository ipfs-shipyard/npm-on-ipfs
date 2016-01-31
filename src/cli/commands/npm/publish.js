var Command = require('ronin').Command
var ipfsAPI = require('ipfs-api')
var debug = require('debug')
var log = debug('registry-mirror')
log.err = debug('registry-mirror:error')

module.exports = Command.extend({
  desc: 'Publish an IPNS record with your current npm list',

  options: {},

  run: function (name) {
    var ctl = ipfsAPI('/ip4/127.0.0.1/tcp/5001')

    ctl.files.stat('/npm-registry', function (err, res) {
      if (err) {
        return log.err('stat', err)
      }
      ctl.block.get(res.Hash, function (err, stream) {
        if (err) {
          return log.err('block get', err)
        }
        ctl.add(stream, function (err, res) {
          if (err) {
            return log.err('add', err)
          }
          ctl.name.publish('/ipfs/' + res[0].Hash, function (err, res) {
            if (err) {
              return log.err('name publish', err)
            }
            log('Published:')
            log('IPNS: ', '/ipns/' + res.Name)
            log('IPFS: ', res.Value)
          })
        })
      })
    })
  }
})
