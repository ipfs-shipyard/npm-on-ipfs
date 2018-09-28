'use strict'

const createPool = require('../utils/create-pool')

// shared executor pool so as to not overwhelm the ipfs daemon
let pool

const getPool = (options) => {
  if (!pool) {
    let concurrency = 100

    if (options.ipfs.port) {
      // do not overload a remote IPFS daemon
      concurrency = options.clone.maxRequests
    }

    pool = createPool(concurrency)
  }

  return pool
}

module.exports = getPool
