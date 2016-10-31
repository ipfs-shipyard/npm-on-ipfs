'use strict'

exports.config = require('./config')
exports.daemon = require('./mirror-daemon')
exports.ipfs = require('./ipfs-client')
exports.registry = {
  clone: require('./registry/clone'),
  index: require('./registry/index'),
  ls: require('./registry/ls')
}
