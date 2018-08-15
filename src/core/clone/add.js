'use strict'

const log = require('debug')('ipfs:registry-mirror:import')
const request = require('request')
const {
  saveJSON
} = require('./files.js')
const createPool = require('../utils/create-pool')
const URL = require('url')

// shared executor pool so as to not overwhelm the ipfs daemon
let pool

const extractTarballsAndUpdatePaths = (options, pkg) => {
  // find all the places we store tarball URLs
  const versions = []
    .concat(
      pkg.json && pkg.json.versions && Object.keys(pkg.json.versions).map(key => pkg.json.versions[key].dist)
    )
    .concat(
      pkg.versions && pkg.versions.map(version => version.json && version.json.dist)
    )
    .concat(
      pkg.tarballs
    )
    .filter(Boolean)

  const tarballs = {}

  versions.forEach(version => {
    if (!tarballs[version.tarball]) {
      const url = URL.parse(version.tarball)

      if (url.protocol === 'http:' && options.clone.upgradeToHttps) {
        url.protocol = 'https:'
      }

      tarballs[version.tarball] = {
        shasum: version.shasum,
        tarball: version.tarball,
        url,
        locations: []
      }
    }

    tarballs[version.tarball].locations.push(version)
  })

  let prefix = `${options.mirror.protocol}://${options.mirror.host}`

  if ((options.mirror.protocol === 'https' && options.mirror.port !== 443) || (options.mirror.protocol === 'http' && options.mirror.port !== 80)) {
    prefix = `${prefix}:${options.mirror.port}`
  }

  Object.keys(tarballs)
    .forEach(key => {
      const tarball = tarballs[key]
      const newLocation = `${prefix}${tarball.url.pathname}`

      tarballs[key].locations.forEach(location => {
        location.tarball = newLocation
      })

      log(`Rewrote ${key} to ${newLocation}`)
    })

  return tarballs
}

const storeTarballs = (options, tarballs, blobStore) => {
  return Promise.all(
    Object.keys(tarballs)
      .map(key => {
        return () => {
          return new Promise((resolve, reject) => {
            const tarball = tarballs[key]

            log(`Storing ${tarball.url.href} at ${tarball.url.pathname}`)

            blobStore.exists(tarball.url.pathname, (error, exists) => {
              if (error && error.code !== 0) {
                console.info('error', error)
                console.info('error.code', error.code)
                return reject(error)
              }

              if (exists) {
                console.info(`🍏️ Already had ${tarball.url.pathname}`)
                return resolve()
              }

              const writeStream = blobStore.createWriteStream(tarball.url.pathname, (error) => {
                if (error) {
                  return reject(error)
                }

                console.info(`🛢️  Stored ${tarball.url.pathname}`)
                return resolve()
              })

              request
                .get(tarball.url.href, options.request)
                .on('error', (error) => {
                  writeStream.end()
                  reject(error)
                })
                .pipe(writeStream)
            })
          })
            .catch(error => {
              console.error(`💥 Error storing tarball ${key} - ${error}`)
              log(error)
            })
        }
      })
      .map(fn => pool.addTask(fn))
  )
}

module.exports = async (options, data, blobStore) => {
  if (!pool) {
    let concurrency = 100

    if (options.ipfs.port) {
      // do not overload a remote IPFS daemon
      concurrency = options.clone.maxRequests
    }

    pool = createPool(concurrency)
  }

  try {
    const tarballs = extractTarballsAndUpdatePaths(options, data)

    await saveJSON(data, blobStore)

    log(`Added ${data.json.name}`)

    if (options.clone.eagerDownload) {
      storeTarballs(options, tarballs, blobStore)
        .catch((error) => {
          console.error(`💥 Error adding ${data.json.name} - ${error}`)
          log(error)
        })
    }
  } catch (error) {
    console.error(`💥 Error adding ${data.json.name} - ${error}`)
    log(error)

    throw error
  }
}
