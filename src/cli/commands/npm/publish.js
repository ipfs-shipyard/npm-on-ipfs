var Command = require('ronin').Command
var ipfsAPI = require('ipfs-api')
var logger = require('../../../logger')

module.exports = Command.extend({
  desc: 'Publish an IPNS record with your current npm list',

  options: {},

  run: function (name) {
    var ctl = ipfsAPI('/ip4/127.0.0.1/tcp/5001')

    ctl.files.stat('/npm-registry', function (err, res) {
      if (err) {
        return logger.error(err)
      }
      ctl.name.publish('/ipfs/' + res.Hash, function (err, res) {
        if (err) {
          return logger.error(err)
        }
        logger.info('Published:')
        logger.info('IPNS: ', '/ipns/' + res.Name)
        logger.info('IPFS: ', res.Value)
      })
    })
  }
})
