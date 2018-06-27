var Command = require('ronin').Command
var debug = require('debug')
var clone = require('../../../npm-pipe-ipfs/clone')
var log = debug('registry-mirror:npm:clone')
log.err = debug('registry-mirror:npm:clone:error')

module.exports = Command.extend({
  desc: 'Clone the npm registry into your local mfs',

  run: function () {
    clone.start()
  }
})
