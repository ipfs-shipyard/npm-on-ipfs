var express = require('express')
var lru = require('lru-cache')
var fs = require('fs')
var url = require('url')
var path = require('path')
var spawn = require('child_process').spawn
var logger = require('davlog')

exports = module.exports = function (folder, blobStore, clone) {
  logger.init({name: 'registry-mirror'})

  var self = this
  var app = express()
  var cache = lru()
  // var port

  var outputDir = folder
  logger.info('using output directory', outputDir)

  if (blobStore) {
    fs = require(blobStore)
  }

  // log each request, set server header
  app.use(function (req, res, cb) {
    logger.info(req.ip, req.method, req.path)
    res.append('Server', 'reginabox')
    cb()
  })

  // serve up main index (no caching)
  app.get('/', function (req, res) {
    res.type('json')

    fs.createReadStream(path.join(outputDir, 'index.json')).pipe(res)
  })

  // serve up tarballs
  app.use(function (req, res, next) {
    if (req.url.slice(-1) === '/') {
      return next() // ignore dirs
    }
    var rs = fs.createReadStream(path.join(outputDir, req.url))
    rs.on('error', function (err) {
      if (err) {
        console.log(err)
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
    var rs = fs.createReadStream(path.join(outputDir, req.url, 'index.json'))
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

  var server = app.listen(function () {
    self.port = exports.port = server.address().port
    logger.info('listening on port', self.port)

    if (!clone) {
      console.log('Not Cloning npm')
      return
    } else {
      console.log('Cloning npm')
    }

    var opts = ['-o', outputDir, '-d', 'localhost']
    if (blobStore) {
      opts.push('--blobstore=' + blobStore)
    }

    var child = spawn(
      path.resolve(require.resolve('registry-static'), '../../bin/registry-static'),
      opts,
      {stdio: 'inherit'}
    )
    process.on('SIGINT', function () {
      child.kill('SIGINT')
      process.kill()
    })
    logger.info('starting registry-static')
  })

  self.close = function () {
    server.close()
  }

  return self
}
