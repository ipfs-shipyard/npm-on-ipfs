var Command = require('ronin').Command
var rm = require('../../../index.js')
var debug = require('debug')
var log = debug('registry-mirror')
log.err = debug('registry-mirror:error')

module.exports = Command.extend({
  desc: 'Publish an IPNS record with your current npm list',

  options: {},

  run: function () {
    rm.registryCache.publish()
  }
})
