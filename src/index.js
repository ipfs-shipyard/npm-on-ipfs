const cloneNpm = require('./clone-npm')
const fetchIPNS = require('./fetch-ipns')
const serveNPM = require('./serve-npm')
const debug = require('debug')
const log = debug('registry-mirror')
log.err = debug('registry-mirror:error')

exports = module.exports = (config) => {
  // Update our /npm-registry MerkleDAG Node if needed

  fetchIPNS(config, (err, hash) => {
    if (err) {
      return log.err('Failed to update mDAG node', err)
    }

    console.log('Updated /npm-registry to:', hash)
  })

  // Clone the entire NPM (and keep cloning)
  if (config.clone) {
    cloneNpm(config)
  }

  return serveNPM(config)
}
