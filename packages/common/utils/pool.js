'use strict'

const createPool = require('../utils/create-pool')

// shared executor pool so as to not overwhelm the ipfs daemon
let pool

const getPool = (config) => {
  if (!pool) {
    let concurrency = 100

    if (config.ipfs.port) {
      // do not overload a remote IPFS daemon
      concurrency = config.clone.maxRequests
    }

    pool = createPool(concurrency)
  }

  return pool
}

module.exports = getPool
