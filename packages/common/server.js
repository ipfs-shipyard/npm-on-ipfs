'use strict'

const express = require('express')
const once = require('once')
const {
  errorLog,
  favicon,
  requestLog
} = require('./handlers')
const prometheus = require('express-prom-bundle')
const promisify = require('util').promisify
const IPFS = require('ipfs')
const metrics = prometheus({
  includeMethod: true,
  autoregister: false
})
const s3Repo = require('./utils/s3-repo')

module.exports = async (config, handlers = async () => {}) => {
  const ipfs = await getAnIPFS(config)

  const app = express()
  app.use(requestLog)

  app.use(metrics)
  app.use('/-/metrics', metrics.metricsMiddleware)

  app.get('/favicon.ico', favicon(config, ipfs, app))
  app.get('/favicon.png', favicon(config, ipfs, app))

  await handlers(app, ipfs)

  app.use(errorLog)

  return new Promise(async (resolve, reject) => {
    const callback = once((error) => {
      if (error) {
        reject(error)
      }

      if (!config.http.port) {
        config.http.port = server.address().port
      }

      console.info(`🚀 Server running on port ${config.http.port}`) // eslint-disable-line no-console

      resolve({
        server,
        app,
        ipfs,
        stop: () => {
          return Promise.all([
            promisify(server.close.bind(server))(),
            ipfs.stop()
          ])
            .then(() => {
              console.info('✋ Server stopped') // eslint-disable-line no-console
            })
        }
      })
    })

    let server = app.listen(config.http.port, callback)
    server.once('error', callback)

    app.locals.ipfs = ipfs
  })
}

const randomPort = () => {
  return Math.floor(Math.random() * 65535) + 1000
}

const getAnIPFS = promisify((config, callback) => {
  if (config.ipfs.port && config.ipfs.host) {
    config.store.port = config.ipfs.port
    config.store.host = config.ipfs.host
    console.info(`👺 Connecting to remote IPFS daemon at ${config.ipfs.port}:${config.ipfs.host}`) // eslint-disable-line no-console
  } else {
    console.info('😈 Using in-process IPFS daemon') // eslint-disable-line no-console
  }

  if (config.ipfs.store === 's3') {
    console.info(`☁️  Using s3 storage`) // eslint-disable-line no-console

    config.ipfs.repo = s3Repo({
      region: config.ipfs.s3.region,
      path: config.ipfs.s3.path,
      bucket: config.ipfs.s3.bucket,
      accessKeyId: config.ipfs.s3.accessKeyId,
      secretAccessKey: config.ipfs.s3.secretAccessKey,
      createIfMissing: config.ipfs.s3.createIfMissing
    })
  }

  if (config.ipfs.store === 'fs') {
    config.ipfs.repo = config.ipfs.fs.repo
  }

  console.info(`🏁 Starting an IPFS instance`) // eslint-disable-line no-console

  const ipfs = new IPFS({
    repo: config.ipfs.repo,
    EXPERIMENTAL: {
      pubsub: true,
      sharding: true
    },
    config: {
      Addresses: {
        Swarm: [
          `/ip4/0.0.0.0/tcp/${config.ipfs.port || randomPort()}`,
          `/ip4/127.0.0.1/tcp/${randomPort()}/ws`
        ],
        API: `/ip4/127.0.0.1/tcp/${randomPort()}`,
        Gateway: `/ip4/127.0.0.1/tcp/${randomPort()}`
      }
    }
  })
  ipfs.once('ready', () => callback(null, ipfs))
  ipfs.once('error', (error) => callback(error))

  process.on('exit', () => {
    ipfs.stop()
  })
})
