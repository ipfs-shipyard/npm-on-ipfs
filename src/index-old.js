const cloneNpm = require('./clone-npm')
const fetchIPNS = require('./fetch-ipns')
const serveNPM = require('./serve-npm')
const debug = require('debug')
const log = debug('registry-mirror')
log.err = debug('registry-mirror:error')
const ipfsAPI = require('ipfs-api')
const fs = require('fs')

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

    if (config.logRootPath) {
      var apiCtl = ipfsAPI('/ip4/127.0.0.1/tcp/5001')
      var stream = fs.createWriteStream(config.logRootPath)
      setInterval(() => {
        apiCtl.files.stat('/npm-registry', function (err, res) {
          if (err) { return log.err(err) }
          stream.write(Date.now() + ' ' + res.Hash + '\n')
        })
      }, 10000)
    }
  }

  return serveNPM(config)
}
