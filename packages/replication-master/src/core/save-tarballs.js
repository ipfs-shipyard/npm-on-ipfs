'use strict'

const createPool = require('registry-mirror-common/utils/create-pool')
const saveTarball = require('registry-mirror-common/utils/save-tarball')

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

const saveTarballs = async (config, pkg, ipfs, emitter) => {
  const pool = getPool(config)

  return Promise.all(
    Object.keys(pkg.versions || {})
      .map(versionNumber => {
        let version = pkg.versions[versionNumber]

        const fn = () => {
          return new Promise((resolve, reject) => {
            const stream = saveTarball(config, pkg.name, versionNumber, ipfs, emitter, resolve)
            stream.once('error', (error) => reject(error))
            stream.on('data', () => {})
          })
        }

        // set an id on our tasks to make sure we don't queue two downloads for the same file
        // this is used by the pool to spot duplicate tasks
        fn.id = version.dist.source

        return fn
      })
      .map(fn => pool.addTask(fn))
  )
}

module.exports = saveTarballs
