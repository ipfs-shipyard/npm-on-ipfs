var express = require('express')
var lru = require('lru-cache')
var fs = require('fs')
var url = require('url')
var path = require('path')
var debug = require('debug')
var log = debug('registry-mirror')
log.err = debug('registry-mirror:error')

exports = module.exports = serveNPM

function serveNPM (config) {
  var self = this
  var app = express()
  var cache = lru()

  log('output dir:', config.outputDir)

  var pathPrefix = config.outputDir
  if (config.ipfs) {
    pathPrefix = ''
  }

  if (config.blobStore) {
    fs = require(config.blobStore)(config.outputDir)
  }

  // log each request, set server header
  app.use(function (req, res, cb) {
    log(req.ip, req.method, req.path)
    res.append('Server', 'registry-mirror')
    cb()
  })

  // serve up main index (no caching)
  app.get('/', function (req, res) {
    res.type('json')

    // fs.createReadStream('index.json').pipe(res)
    fs.createReadStream(path.join(pathPrefix, 'index.json')).pipe(res)
  })

  // serve up tarballs
  app.use(function (req, res, next) {
    if (req.url.slice(-1) === '/') {
      return next() // ignore dirs
    }
    // var rs = fs.createReadStream(req.url)
    var rs = fs.createReadStream(path.join(pathPrefix, req.url))

    rs.on('error', function (err) {
      if (err) {

      }
      return next()
    })
    rs.pipe(res)
  })

  // serve up metadata. doing it manually so we can modify JSON
  app.use(function (req, res) {
    var cached = cache.get(req.url)
    if (cached) {
      res.type('json')
      res.send(cached)
      return
    }

    var file = ''
    // var rs = fs.createReadStream(path.join(req.url, 'index.json'))
    var rs = fs.createReadStream(path.join(pathPrefix, req.url, 'index.json'))

    rs.on('error', function (err) {
      res.sendStatus(err.code === 'ENOENT' ? 404 : 500)
      return
    })
    rs.on('data', function (chunk) {
      file = file + chunk.toString('utf8')
    })
    rs.on('end', function () {
      var data = JSON.parse(file)
      if (data && data.versions && typeof data.versions === 'object') {
        Object.keys(data.versions).forEach(function (versionNum) {
          var version = data.versions[versionNum]
          if (version.dist && version.dist.tarball && typeof version.dist.tarball === 'string') {
            var parts = url.parse(version.dist.tarball)
            version.dist.tarball = 'http://' + req.hostname + ':' + self.port + parts.path
          }
        })
      }
      var buf = new Buffer(JSON.stringify(data))
      cache.set(req.url, buf)
      res.type('json')
      res.send(buf)
    })
  })

  var server = self.server = app.listen(config.port, config.host, function () {
    var address = server.address()
    self.port = exports.port = address.port

    log('listening:' + address.address + ':' + address.port)
  })

  self.close = function () {
    server.close()
  }

  return self
}
