'use strict'

const request = require('../utils/retry-request')
const log = require('debug')('ipfs:registry-mirror:utils:load-manifest')
const saveManifest = require('./save-manifest')
const replaceTarballUrls = require('./replace-tarball-urls')

const loadManifest = async (options, ipfs, packageName) => {
  let mfsVersion = {}
  let npmVersion = {}

  const mfsPath = `${options.store.baseDir}/${packageName}`
  const npmUrl = `${options.mirror.registry}/${packageName}`

  try {
    mfsVersion = JSON.parse(await ipfs.files.read(mfsPath))
  } catch (error) {
    if (error.message.includes('file does not exist')) {
      log(`${mfsPath} not in MFS`)
    } else {
      log(`Could not read ${mfsPath}`, error)
    }
  }

  const modified = new Date((mfsVersion.time && mfsVersion.time.modified) || 0)
  const willDownload = (Date.now() - options.mirror.registryUpdateInterval) > modified.getTime()

  if (willDownload) {
    try {
      log(`Fetching ${npmUrl}`)
      const start = Date.now()
      npmVersion = await request(Object.assign({}, options.request, {
        uri: npmUrl,
        json: true
      }))
      log(`Fetched ${npmUrl} in ${Date.now() - start}ms`)
    } catch (error) {
      log(`Could not download ${npmUrl}`, error)
    }
  }

  if (!mfsVersion._rev && !npmVersion._rev) {
    throw new Error(`Not found, tried npm: ${willDownload}`)
  }

  if (mfsVersion._rev && (!npmVersion._rev || npmVersion._rev === mfsVersion._rev)) {
    // we have a cached version and either fetching from npm failed or
    // our cached version matches the npm version
    return mfsVersion
  }

  console.info(`🆕 New version of ${packageName} detected`)

  npmVersion = replaceTarballUrls(options, npmVersion)

  // save our existing versions so we don't re-download tarballs we already have
  Object.keys(mfsVersion.versions || {}).forEach(versionNumber => {
    npmVersion.versions[versionNumber] = mfsVersion.versions[versionNumber]
  })

  // store it for next time
  await saveManifest(npmVersion, ipfs, options)

  return npmVersion
}

module.exports = loadManifest
