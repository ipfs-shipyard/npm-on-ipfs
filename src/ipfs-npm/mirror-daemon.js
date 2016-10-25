'use strict'

const express = require('express')
const lru = require('lru-cache')
const url = require('url')
const debug = require('debug')
const log = debug('registry-mirror')
log.err = debug('registry-mirror:error')
const ibs = require('ipfs-blob-store')
const config = require('./config.js')

exports = module.exports = Mirror

function Mirror (callback) {
  if (!(this instanceof Mirror)) {
    return new Mirror(callback)
  }

  const app = express()
  const cache = lru()

  const store = ibs(config.blobStore)

  // serve up main index (no caching)
  app.get('/', (req, res) => {
    res.type('json')
    store.createReadStream('/-/index.json').pipe(res)
  })

  // serve up tarballs
  app.use((req, res, next) => {
    if (req.url.slice(-1) === '/') {
      return next() // ignore dirs
    }

    const rs = store.createReadStream(req.url)

    rs.on('error', (err) => {
      if (err) {}
      return next()
    })
    rs.pipe(res)
  })

  // serve up metadata. doing it manually so we can modify JSON
  app.use((req, res) => {
    const cached = cache.get(req.url)
    if (cached) {
      res.type('json')
      res.send(cached)
      return
    }

    let file = ''
    const rs = store.createReadStream(req.url + '/index.json')

    rs.on('error', (err) => {
      res.sendStatus(err.code === 'ENOENT' ? 404 : 500)
      return
    })
    rs.on('data', (chunk) => {
      file = file + chunk.toString('utf8')
    })
    rs.on('end', () => {
      const data = JSON.parse(file)
      if (data && data.versions && typeof data.versions === 'object') {
        Object.keys(data.versions).forEach((versionNum) => {
          const version = data.versions[versionNum]
          if (version.dist && version.dist.tarball && typeof version.dist.tarball === 'string') {
            const parts = url.parse(version.dist.tarball)
            version.dist.tarball = 'http://' + req.hostname + ':' + this.port + parts.path
          }
        })
      }
      const buf = new Buffer(JSON.stringify(data))
      cache.set(req.url, buf)
      res.type('json')
      res.send(buf)
    })
  })

  this.server = app.listen(config.mirror.port, config.mirror.host, () => {
    const addr = this.server.address()
    this.port = addr.port

    console.log('mirror is running')
    console.log('use npm with --registry=http://' + addr.address + ':' + addr.port)
    callback()
  })
}
