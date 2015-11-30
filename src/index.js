var cloneNpm = require('./clone-npm')
var fetchIPNS = require('./fetch-ipns')
var serveNPM = require('./serve-npm')
var logger = require('./logger')

exports = module.exports = function (config) {
  // Update our /npm-registry MerkleDAG Node if needed
  fetchIPNS(config, function (err, hash) {
    if (err) {
      return logger.err('Failed to update mDAG node', err)
    }

    logger.info('Updated /npm-registry to:', hash)
  })

  // Clone the entire NPM (and keep cloning)
  if (config.clone) {
    cloneNpm(config)
  }

  return serveNPM(config)
}
