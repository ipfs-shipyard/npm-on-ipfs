var cloneNpm = require('./clone-npm')
var fetchIPNS = require('./fetch-ipns')
var serveNPM = require('./serve-npm')

exports = module.exports = function (config) {
  // Update our /npm-registry MerkleDAG Node if needed
  fetchIPNS(config)

  // Clone the entire NPM (and keep cloning)
  if (config.clone) {
    cloneNpm(config)
  }

  return serveNPM(config)
}
