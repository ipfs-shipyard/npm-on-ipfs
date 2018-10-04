'use strict'

const express = require('express')
const once = require('once')
const config = require('./config')
const {
  tarball,
  manifest,
  favicon,
  root
} = require('./handlers')
const clone = require('./clone')
const getExternalUrl = require('./utils/get-external-url')
const proxy = require('express-http-proxy')
const prometheus = require('express-prom-bundle')
const promisify = require('util').promisify
const IPFS = require('ipfs')
const metrics = prometheus({
  includeMethod: true,
  autoregister: false
})

module.exports = async (options) => {
  options = config(options)

  console.info(`📦 Mirroring npm on ${getExternalUrl(options)}`)

  const ipfs = await getAnIPFS(options)

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

  app.use(metrics)
  app.use('/-/metrics', metrics.metricsMiddleware)

  // let the world know what version we are
  app.get('/', root(options, ipfs, app))
  app.get('/favicon.ico', favicon(options, ipfs, app))
  app.get('/favicon.png', favicon(options, ipfs, app))

  // intercept requests for tarballs and manifests
  app.get('/*.tgz', tarball(options, ipfs, app))
  app.get('/*', manifest(options, ipfs, app))

  // everything else should just proxy for the registry
  const registry = proxy(options.mirror.registry, {
    limit: options.mirror.uploadSizeLimit
  })
  app.put('/*', registry)
  app.post('/*', registry)
  app.patch('/*', registry)
  app.delete('/*', registry)

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

  if (options.clone.enabled) {
    clone(options, ipfs)
  }

  return new Promise(async (resolve, reject) => {
    const callback = once((error) => {
      if (error) {
        reject(error)
      }

      if (!options.mirror.port) {
        options.mirror.port = server.address().port
      }

      let url = getExternalUrl(options)

      console.info('🚀 Server running')
      console.info(`🔧 Please either update your npm config with 'npm config set registry ${url}'`)
      console.info(`🔧 or use the '--registry' flag, eg: 'npm install --registry=${url}'`)

      resolve({
        server,
        app,
        stop: () => {
          return Promise.all([
            promisify(server.close.bind(server))(),
            ipfs.stop()
          ])
            .then(() => {
              console.info('✋ Server stopped')
            })
        }
      })
    })

    let server = app.listen(options.mirror.port, callback)
    server.once('error', callback)

    app.locals.ipfs = ipfs
  })
}

const getAnIPFS = promisify((options, callback) => {
  console.info(`🏁 Starting an IPFS instance`)
  callback = once(callback)

  const ipfs = new IPFS({
    repo: options.ipfs.repo
  })
  ipfs.once('ready', () => callback(null, ipfs))
  ipfs.once('error', (error) => callback(error))
})
