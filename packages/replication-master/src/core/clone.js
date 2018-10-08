'use strict'

const follow = require('follow-registry')
const log = require('debug')('ipfs:registry-mirror:clone')
const replaceTarballUrls = require('registry-mirror-common/utils/replace-tarball-urls')
const saveManifest = require('registry-mirror-common/utils/save-manifest')
const loadManifest = require('registry-mirror-common/utils/load-manifest')
const saveTarballs = require('./save-tarballs')

const add = async (config, pkg, ipfs, emitter) => {
  log(`Adding ${pkg.name}`)

  try {
    await saveManifest(pkg, ipfs, config)
  } catch (error) {
    log(`Error adding manifest for ${pkg.name} - ${error.stack}`)
  }

  try {
    await saveTarballs(config, pkg, ipfs, emitter)

    log(`Added ${pkg.name}`)
  } catch (error) {
    log(`Error adding tarballs for ${pkg.name} - ${error.stack}`)
  }

  return pkg
}

module.exports = (config, ipfs, emitter) => {
  console.info('🦎 Replicating registry...') // eslint-disable-line no-console

  follow(Object.assign({}, config.follow, {
    handler: async (data, callback) => {
      if (!data.json || !data.json.name) {
        return callback() // Bail, something is wrong with this change
      }

      console.info(`🎉 Updated version of ${data.json.name}`) // eslint-disable-line no-console

      const pkg = replaceTarballUrls(config, data.json)
      const mfsPath = `${config.ipfs.prefix}/${data.json.name}`

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
        await add(config, pkg, ipfs, emitter)
        const manifest = await loadManifest(config, ipfs, pkg.name)
        console.log(`🦕 [${data.seq}] processed ${manifest.name}`) // eslint-disable-line no-console
        emitter.emit('processed', manifest)
      } catch (error) {
        log(error)
        console.error(`💥 [${data.seq}] error processing ${pkg.name} - ${error}`) // eslint-disable-line no-console
      }

      callback()
    }
  }))
}
