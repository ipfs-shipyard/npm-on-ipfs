'use strict'

const log = require('debug')('ipfs:registry-mirror:replicate:save-tarball')
const request = require('../utils/retry-request')
const CID = require('cids')
const crypto = require('crypto')
const loadManifest = require('../utils/load-manifest')
const saveManifest = require('../utils/save-manifest')
const {
  PassThrough
} = require('stream')

const saveTarball = (options, packageName, versionNumber, ipfs, emitter) => {
  const outputStream = new PassThrough()

  loadManifest(options, ipfs, packageName)
    .then(async (manifest) => {
      const version = manifest.versions[versionNumber]

      validate(version, versionNumber, packageName)

      if (version.dist.cid) {
        log(`Skipping version ${versionNumber} of ${packageName} - already downloaded`)
        outputStream.end()

        return
      }

      const startTime = Date.now()
      const cid = await downloadFile(options, ipfs, version.dist.source, version.dist.shasum, outputStream)

      console.info(`🏄‍♀️ Added ${version.dist.source} with hash ${cid} in ${Date.now() - startTime}ms`)

      await updateCid(options, ipfs, packageName, versionNumber, cid)
    })
    .catch(error => {
      console.error(`💥 Error storing tarball ${packageName} ${versionNumber} - ${error.stack}`)
    })

  return outputStream
}

const validate = (version, versionNumber, packageName) => {
  if (!version) {
    throw new Error(`Skipping invalid version ${versionNumber} of ${packageName} - version not in manifest`)
  }

  if (!version.dist) {
    throw new Error(`Skipping invalid version ${versionNumber} of ${packageName} - no dist section`)
  }

  if (!version.dist.source) {
    throw new Error(`Skipping invalid version ${versionNumber} of ${packageName} - no source`)
  }

  if (!version.dist.shasum) {
    throw new Error(`Skipping invalid version ${versionNumber} of ${packageName} - no shasum`)
  }
}

const updateCid = async (options, ipfs, packageName, versionNumber, cid) => {
  while (true) {
    let manifest = await loadManifest(options, ipfs, packageName)
    manifest.versions[versionNumber].dist.cid = cid

    await saveManifest(manifest, ipfs, options)

    manifest = await loadManifest(options, ipfs, packageName)

    if (manifest.versions[versionNumber].dist.cid === cid) {
      return
    }
  }
}

const downloadFile = async (options, ipfs, url, shasum, outputStream) => {
  log(`Downloading ${url}`)

  const hash = crypto.createHash('sha1')
  hash.setEncoding('hex')
  hash.on('error', () => {})

  return request(Object.assign({}, options.request, {
    uri: url
  }))
    .then(stream => {
      stream.pipe(outputStream)
      stream.pipe(hash)

      return ipfs.files.add(stream, {
        wrapWithDirectory: false
      })
    })
    .then(files => {
      const result = hash.read()

      if (result !== shasum) {
        // we've already piped to the client at this point so can't retry the download
        // abort saving the CID of the corrupted download to our copy of the manifest
        // instead so we retry next time it's requested
        throw new Error(`File downloaded from ${url} had invalid shasum ${result} - expected ${shasum}`)
      }

      log(`File downloaded from ${url} had shasum ${result} - matched ${shasum}`)

      const file = files.pop()

      return new CID(file.hash).toV1().toBaseEncodedString('base32')
    })
}

module.exports = saveTarball
