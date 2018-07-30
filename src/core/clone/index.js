'use strict'

require('dnscache')({ enable: true })

const follow = require('follow-registry')
const log = require('debug')('ipfs:registry-mirror:clone')
const patch = require('patch-package-json')
const request = require('request')
const timethat = require('timethat').calc
const once = require('once')
const {
  saveJSON
} = require('./files.js')
const clean = require('./clean')
const ipfsBlobStore = require('ipfs-blob-store')
const URL = require('url')
const add = require('./add')

const createRegistryUpdateHandler = (options, blobStore) => {
  return function onRegistryUpdate (data, callback) {
    if (!data.json.name) {
      return callback() // Bail, something is wrong with this change
    }

    callback = once(callback)

    add(options, data, blobStore)
      .then(() => {
        console.log(`🐙 [${data.seq}] processed ${data.json.name}`)
        setTimeout(() => callback(), options.clone.delay)
      })
      .catch((error) => {
        console.error(`💥 [${data.seq}] error processing ${data.json.name} - ${error}`)
        setTimeout(() => callback(error), options.clone.delay)
      })
  }
}

module.exports = (options) => {
  console.info('🌈 Cloning registry...')

  if (options.clone.downloadTarballs) {
    console.info('🍭 Downloading tarballs')
  }

  follow({
    ua: options.clone.userAgent,
    skim: options.clone.skim,
    //registry: options.clone.registry,
    handler: createRegistryUpdateHandler(options, ipfsBlobStore(options.ipfs))
  })
}
