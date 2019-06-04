'use strict'

const express = require('express')
const proxy = require('express-http-proxy')
const once = require('once')
const requestLog = require('ipfs-registry-mirror-common/handlers/request-log')
const errorLog = require('ipfs-registry-mirror-common/handlers/error-log')
const favicon = require('ipfs-registry-mirror-common/handlers/favicon')
const root = require('../handlers/root')
const tarball = require('../handlers/tarball')
const manifest = require('../handlers/manifest')
const getIpfs = require('../middleware/get-ipfs')

const startServer = (config) => {
  const app = express()

  app.use(requestLog)

  app.get('/favicon.ico', favicon(config, app))
  app.get('/favicon.png', favicon(config, app))

  app.get('/', getIpfs(config), root(config, app))

  // intercept requests for tarballs and manifests
  app.get('/*.tgz', getIpfs(config), tarball(config, app))
  app.get('/*', getIpfs(config), manifest(config, app))

  // everything else should just proxy for the registry
  const registry = proxy(config.registry, {
    limit: config.registryUploadSizeLimit
  })
  app.put('/*', registry)
  app.post('/*', registry)
  app.patch('/*', registry)
  app.delete('/*', registry)

  app.use(errorLog)

  return new Promise((resolve, reject) => {
    const callback = once((error) => {
      if (error) {
        reject(error)
      }

      if (!config.http.port) {
        config.http.port = server.address().port
      }

      console.info(`🚀 Server running on port ${config.http.port}`) // eslint-disable-line no-console

      resolve(server)
    })

    let server = app.listen(config.http.port, callback)
    server.once('error', callback)
  })
}

module.exports = startServer
