'use strict'

const log = require('debug')('ipfs:registry-mirror:utils:save-manifest')

const saveManifest = async (pkg, ipfs, config) => {
  if (!pkg.name || pkg.error) {
    const error = pkg.error || new Error('No name found in package.json')

    throw error
  }

  const file = `${config.ipfs.prefix}/${pkg.name}`

  log(`Writing json for ${pkg.name} to ${file}`)

  return ipfs.files.write(file, Buffer.from(JSON.stringify(pkg)), {
    create: true,
    truncate: true,
    parents: true,
    flush: config.ipfs.flush
  })
    .then(() => {
      log(`Wrote manifest for ${pkg.name} to ${file}`)
    })
}

module.exports = saveManifest
