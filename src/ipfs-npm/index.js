exports.config = require('./config.js')
exports.daemon = require('./mirror-daemon')
exports.ipfs = require('./ipfs-client.js')
exports.registry = {}
exports.registry.clone = require('./registry-clone')
// exports.registry.index = require('./registry-index')
// exports.registry.ls = require('./ls')
