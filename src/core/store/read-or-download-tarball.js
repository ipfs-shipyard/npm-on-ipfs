'use strict'

const saveTarball = require('../clone/save-tarball')
const CID = require('cids')
const loadManifest = require('../utils/load-manifest')

const readOrDownloadTarball = async (options, ipfs, path, emitter) => {
  const {
    packageName,
    packageVersion
  } = extractPackageDetails(path)

  let manifest = await loadManifest(options, ipfs, packageName)
  let version = manifest.versions[packageVersion]

  if (!version) {
    throw new Error(`Could not find version ${packageName}@${packageVersion} in available versions ${Object.keys(manifest.versions)}`)
  }

  if (!version.dist.cid) {
    return saveTarball(options, manifest.name, packageVersion, ipfs, emitter)
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

  return ipfs.files.readReadableStream(`/ipfs/${v0Cid}`)
}

const extractPackageDetails = (path) => {
  let [
    packageName, fileName
  ] = path.split('/-/')

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
