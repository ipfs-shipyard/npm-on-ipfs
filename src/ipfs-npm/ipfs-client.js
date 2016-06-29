const ipfsAPI = require('ipfs-api')

module.exports = ipfs

function ipfs (options) {
  if (!options || !options.url) {
    options = {
      url: '/ip4/127.0.0.1/tcp/5001'
    }
  }

  // TODO
  // 1. check if there is a node running (through IPFS_PATH)
  // if not, spawn one

  return ipfsAPI(options.url)
}
