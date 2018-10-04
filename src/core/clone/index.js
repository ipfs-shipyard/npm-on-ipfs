'use strict'

const follow = require('follow-registry')
const once = require('once')
const EventEmitter = require('events').EventEmitter
const log = require('debug')('ipfs:registry-mirror:clone')
const replaceTarballUrls = require('../utils/replace-tarball-urls')
const saveManifest = require('../utils/save-manifest')
const saveTarballs = require('./save-tarballs')

const emitter = new EventEmitter()

const add = async (options, pkg, ipfs, emitter) => {
  log(`Adding ${pkg.name}`)

  pkg = replaceTarballUrls(options, pkg)

  saveManifest(pkg, ipfs, options)
    .then(() => {
      if (options.clone.eagerDownload) {
        log(`Eagerly downloading tarballs for ${pkg.name}`)

        saveTarballs(options, pkg, ipfs, emitter)
          .then(() => {
            log(`Added ${pkg.name}`)

            emitter.emit('processed', pkg)
          })
          .catch(error => {
            log(`Error adding tarballs for ${pkg.name} - ${error.stack}`)
            emitter.emit('error', error)
          })
      } else {
        log(`Not eagerly downloading tarballs for ${pkg.name}`)

        emitter.emit('processed', pkg)
      }
    })
    .catch(error => {
      log(`Error adding manifest for ${pkg.name} - ${error.stack}`)
      emitter.emit('error', error)
    })

  return pkg
}

module.exports = (options, ipfs) => {
  console.info('🦎 Replicating registry...')

  follow({
    ua: options.clone.userAgent,
    skim: options.clone.skim,
    registry: options.clone.registry,
    handler: async (data, callback) => {
      if (!data.json || !data.json.name) {
        return callback() // Bail, something is wrong with this change
      }

      console.info(`🎉 Updated version of ${data.json.name} received`)

      callback = once(callback)

      const mfsPath = `${options.store.baseDir}/${data.json.name}`

      const mfsVersion = await ipfs.files.read(mfsPath)
        .then(buffer => JSON.parse(buffer))
        .catch(error => {
          if (error.message.includes('file does not exist')) {
            log(`${mfsPath} not in MFS`)
          } else {
            log(`Could not read ${mfsPath}`, error)
          }

          return {}
        })

      // save our existing versions so we don't re-download tarballs we already have
      Object.keys(mfsVersion.versions || {}).forEach(versionNumber => {
        data.json.versions[versionNumber] = mfsVersion.versions[versionNumber]
      })

      add(options, data.json, ipfs, emitter)
        .then(() => {
          console.log(`🦕 [${data.seq}] processed ${data.json.name}`)
        })
        .catch((error) => {
          log(error)
          console.error(`💥 [${data.seq}] error processing ${data.json.name} - ${error}`)
        })
        .then(() => {
          setTimeout(() => callback(), options.clone.delay)
        })
    }
  })

  return emitter
}
