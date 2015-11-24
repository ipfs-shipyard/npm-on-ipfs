var express = require('express')
var lru = require('lru-cache')
var fs = require('fs')
var url = require('url')
var path = require('path')
var spawn = require('child_process').spawn
var logger = require('davlog')
var ipfsAPI = require('ipfs-api')

exports = module.exports = function (config) {
  logger.init({name: 'registry-mirror'})

  var self = this
  var app = express()
  var cache = lru()

  logger.info('using output directory', config.outputDir)

  var pathPrefix = config.outputDir
  if (config.ipfs) {
    pathPrefix = ''
  }

  if (config.blobStore) {
    fs = require(config.blobStore)(config.outputDir)

    if (!config.clone) {
      var apiCtl = ipfsAPI('/ip4/127.0.0.1/tcp/5001')

      var castorAddr = '/ip4/37.59.33.238/tcp/4001/ipfs/QmdNc4B89DxVeiuDKRN5bWdKsAPCmekgmJMkRSdUNa7x9z'
      apiCtl.swarm.connect(castorAddr, function (err) {
        if (err) {
          return logger.info('Could not connect to Castor', err)
        }

        apiCtl.files.stat('/npm-registry', function (err) {
          if (err && err.code === 0) {
            return copyNpmRegistry()
          }

          apiCtl.files.mv(['/npm-registry', '/npm-registry' + Date.now().toString()], function (err) {
            if (err) {
              return console.log('a', err)
            }

            copyNpmRegistry()
          })

          function copyNpmRegistry () {
            console.log('ipns')
            apiCtl.name.resolve('/ipns/QmdNc4B89DxVeiuDKRN5bWdKsAPCmekgmJMkRSdUNa7x9z', function (err, res) {
              if (err) {
                return console.log('b', err)
              }

              console.log('cp', res.Path)
              apiCtl.files.cp([res.Path, '/npm-registry'], function (err) {
                if (err) {
                  return console.log('c', err)
                }
                logger.info('Updated directory listing, good to go :)')
              })
            })
          }
        })
      })
    }
  }

  // log each request, set server header
  app.use(function (req, res, cb) {
    logger.info(req.ip, req.method, req.path)
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
    logger.info('listening on ' + address.address + ':' + address.port)

    if (!config.clone) {
      return logger.info('Cloning NPM OFF')
    } else {
      logger.info('Cloning NPM ON')
    }

    var opts = ['-o', config.outputDir, '-d', 'localhost']
    if (config.blobStore) {
      opts.push('--blobstore=' + config.blobStore)
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
