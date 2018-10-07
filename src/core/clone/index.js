'use strict'

const follow = require('follow-registry')
const log = require('debug')('ipfs:registry-mirror:clone')
const replaceTarballUrls = require('../utils/replace-tarball-urls')
const saveManifest = require('../utils/save-manifest')
const loadManifest = require('../utils/load-manifest')
const saveTarballs = require('./save-tarballs')
const delay = require('promise-delay')

const add = async (options, pkg, ipfs, emitter) => {
  log(`Adding ${pkg.name}`)

  try {
    await saveManifest(pkg, ipfs, options)
  } catch (error) {
    log(`Error adding manifest for ${pkg.name} - ${error.stack}`)
  }

  try {
    await saveTarballs(options, pkg, ipfs, emitter)

    log(`Added ${pkg.name}`)
  } catch (error) {
    log(`Error adding tarballs for ${pkg.name} - ${error.stack}`)
  }

  return pkg
}

module.exports = (options, ipfs, emitter) => {
  console.info('🦎 Replicating registry...')

  follow({
    ua: options.clone.userAgent,
    skim: options.clone.skim,
    registry: options.clone.registry,
    concurrency: 1,
    handler: async (data, callback) => {
      if (!data.json || !data.json.name) {
        return callback() // Bail, something is wrong with this change
      }

      console.info(`🎉 Updated version of ${data.json.name}`)

      const manifest = loadManifest(options, ipfs, data.json.name)
      const pkg = replaceTarballUrls(options, data.json)
      const mfsPath = `${options.store.baseDir}/${data.json.name}`

      let mfsVersion = {}

      try {
        mfsVersion = JSON.parse(await ipfs.files.read(mfsPath))
      } catch (error) {
        if (error.message.includes('file does not exist')) {
          log(`${mfsPath} not in MFS`)
        } else {
          log(`Could not read ${mfsPath}`, error)
        }
      }

      // save our existing versions so we don't re-download tarballs we already have
      Object.keys(mfsVersion.versions || {}).forEach(versionNumber => {
        pkg.versions[versionNumber] = mfsVersion.versions[versionNumber]
      })

      try {
        await add(options, pkg, ipfs, emitter)
        console.log(`🦕 [${data.seq}] processed ${pkg.name}`)
        emitter.emit('processed', pkg)
      } catch (error) {
        log(error)
        console.error(`💥 [${data.seq}] error processing ${pkg.name} - ${error}`)
      }

      await delay(options.clone.delay)

      callback()
    }
  })
}
