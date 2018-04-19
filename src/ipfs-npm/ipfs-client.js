'use strict'

const ipfsAPI = require('ipfs-api')

module.exports = ipfs

function ipfs (options, callback) {
  if (!options || !options.url) {
    options = {
      url: '/ip4/127.0.0.1/tcp/5001'
    }
  }

  // TODO
  // 1. check if there is a node running (through IPFS_PATH)
  // if not, spawn one

  const api = ipfsAPI(options.url)

  api.version((err, version) => {
    if (err) {
      return callback(new Error(`Failed to connect to a daemon on "${options.url}"`))
    }

    console.log('Connected to a daemon on "%s" with version "%s"', options.url, version.version)
    callback(null, api)
  })
}
