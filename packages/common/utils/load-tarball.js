'use strict'

const saveTarball = require('./save-tarball')
const CID = require('cids')
const loadManifest = require('../utils/load-manifest')

const readOrDownloadTarball = async (config, ipfs, path, emitter) => {
  const {
    packageName,
    packageVersion
  } = extractPackageDetails(path)

  let manifest = await loadManifest(config, ipfs, packageName)
  let version = manifest.versions[packageVersion]

  if (!version) {
    throw new Error(`Could not find version ${packageName}@${packageVersion} in available versions ${Object.keys(manifest.versions)}`)
  }

  if (!version.dist.cid) {
    return saveTarball(config, manifest.name, packageVersion, ipfs, emitter)
  }

  if (!version.dist.cid) {
    throw new Error(`CID for ${packageName}@${packageVersion} missing after download`)
  }

  let v0Cid

  try {
    v0Cid = new CID(version.dist.cid).toV0().toBaseEncodedString()
  } catch (error) {
    throw new Error(`Could not turn ${version.dist.cid} into a CID - ${error.stack}`)
  }

  return ipfs.files.catReadableStream(`/ipfs/${v0Cid}`)
}

const extractPackageDetails = (path) => {
  let [
    packageName, fileName
  ] = path.split('/-/')

  if (packageName.startsWith('/')) {
    packageName = packageName.substring(1)
  }

  let moduleName = packageName

  if (packageName.startsWith('@')) {
    moduleName = packageName.split('/').pop()
  }

  const packageVersion = fileName.substring(moduleName.length + 1, fileName.length - 4)

  return {
    packageName,
    packageVersion
  }
}

module.exports = readOrDownloadTarball
