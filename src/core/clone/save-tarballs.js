'use strict'

const getPool = require('./pool')
const saveTarball = require('./save-tarball')

const saveTarballs = async (options, pkg, ipfs, emitter) => {
  const pool = getPool(options)

  return Promise.all(
    Object.keys(pkg.versions || {})
      .map(versionNumber => {
        let version = pkg.versions[versionNumber]

        const fn = () => {
          return new Promise((resolve, reject) => {
            const stream = saveTarball(options, pkg.name, versionNumber, ipfs, emitter)
            stream.once('finish', () => resolve())
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
