'use strict'

const log = require('debug')('ipfs:registry-mirror:import')
const request = require('request')
const {
  saveJSON
} = require('./files.js')
const URL = require('url')

const updatePaths = (options, pkg, blobStore) => {
  return new Promise((resolve, reject) => {
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
        tarballs[version.tarball] = {
          shasum: version.shasum,
          tarball: version.tarball,
          locations: []
        }
      }

      tarballs[version.tarball].locations.push(version)
    })

    resolve(tarballs)
  })
    .then(tarballs => Promise.all(
      Object.keys(tarballs)
        .map(key => {
          return new Promise((resolve, reject) => {
            const url = URL.parse(key)

            if (url.protocol === 'http:' && options.clone.upgradeToHttps) {
              url.protocol = 'https:'
            }

            if (!options.clone.downloadTarballs) {
              return resolve({
                key: url.pathname
              })
            }

            log(`Storing ${url.href} at ${url.pathname}`)

            const writeStream = blobStore.createWriteStream(url.pathname, (error, meta) => {
              if (error) {
                return reject(error)
              }

              return resolve(meta)
            })

            request
              .get(url.href, options.request)
              .pipe(writeStream)
          })
            .then(meta => {
              let prefix = `${options.mirror.protocol}://${options.mirror.host}`

              if ((options.mirror.protocol === 'https' && options.mirror.port !== 443) || (options.mirror.protocol === 'http' && options.mirror.port !== 80)) {
                prefix = `${prefix}:${options.mirror.port}`
              }

              const newLocation = `${prefix}${meta.key}`

              tarballs[key].locations.forEach(location => {
                location.tarball = newLocation
              })

              log(`Rewrote ${key} to ${newLocation}`)
            })
        })
    ))
}

module.exports = async (options, data, blobStore) => {
  try {
    await updatePaths(options, data, blobStore)
    await saveJSON(data, blobStore)

    log(`Added ${data.json.name}`)
  } catch (error) {
    console.error(`💥 Error adding ${data.json.name} - ${error}`)

    throw error
  }
}
