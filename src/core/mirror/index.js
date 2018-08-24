'use strict'

const express = require('express')
const once = require('once')
const config = require('../config')
const {
  json,
  tarball
} = require('./handlers')
const clone = require('../clone')
const store = require('./store')
const ipfsBlobStore = require('ipfs-blob-store')
const getExternalUrl = require('../utils/get-external-url')

module.exports = async (options) => {
  options = config(options)

  console.info(`📦 Mirroring npm on ${getExternalUrl(options)}`)

  const app = express()
  app.use(function (request, response, next) {
    response.locals.start = Date.now()

    response.on('finish', () => {
      const disposition = response.getHeader('Content-Disposition')
      let prefix = '📄'

      if (disposition && disposition.endsWith('tgz"')) {
        prefix = '🎁'
      }

      console.info(`${prefix} ${request.method} ${request.url} ${response.statusCode} ${Date.now() - response.locals.start}ms`)
    })

    next()
  })

  app.get('/**/*.tgz', tarball)
  app.get('/*', json)

  app.use(function (error, request, response, next) {
    console.error(`💀 ${request.method} ${request.url} ${response.statusCode} - ${error.stack}`)

    next()
  })

  if (options.ipfs.port && options.ipfs.host) {
    options.store.port = options.ipfs.port
    options.store.host = options.ipfs.host
    console.info(`👺 Connecting to remote IPFS daemon at ${options.ipfs.port}:${options.ipfs.host}`)
  } else {
    console.info('😈 Using in-process IPFS daemon')
  }

  const blobStore = await ipfsBlobStore(options.store)

  if (options.clone.enabled) {
    clone(options, blobStore)
  }

  return new Promise(async (resolve, reject) => {
    const callback = once((error) => {
      if (error) {
        reject(error)
      }

      let url = getExternalUrl(options)

      console.info('🚀 Server running')
      console.info(`🔧 Please either update your npm config with 'npm config set registry ${url}'`)
      console.info(`🔧 or use the '--registry' flag, eg: 'npm install --registry=${url}'`)

      resolve(server)
    })

    let server = app.listen(options.mirror.port, callback)
    server.once('error', callback)

    app.locals.store = store(options, blobStore, server)
  })
}
