const http = require('http-https')
const config = require('./../config')
const hooks = require('./hooks')
const timethat = require('timethat').calc
const url = require('url')
const uparse = url.parse
const pretty = require('prettysize')
const log = config.log
const blobStore = require('./ibs')

const counter = {}
const report = {}

exports.report = () => {
  return report
}

exports.counter = () => {
  return counter
}

exports.update = (info, callback) => {
  const url = config.registry + info.path.substring(1)
  var callbackDone = false
  process.nextTick(() => {
    const writer = blobStore.createWriteStream(info.tarball)
    counter[info.path] = counter[info.path] || 0
    counter[info.path]++
    log('[' + counter[info.path] + '] downloading', url)
    const startDL = new Date()
    const u = uparse(url)
    u.headers = {
      'user-agent': 'registry static mirror worker'
    }
    const req = http.get(u)
      .on('error', (e) => {
        callbackDone = true
        req.end()
        log(' [' + counter[info.path] + '] failed to download', info.tarball)
        report.error = e
        report[info.tarball] = info
        delete counter[info.path]
        // in case end has already been called by the error handler
        // sometimes it happens :(
        try {
          writer.end()
        } catch (err) {}
        return callback(new Error('failed to download ' + info.tarball))
      })
      .on('response', function (res) {
        log('[' + counter[info.path] + ']', '(' + res.statusCode + ')', info.path, 'is', pretty(res.headers['content-length']))
        info.http = res.statusCode
        if (res.statusCode === 404) {
          log(' [' + counter[info.path] + '] failed to download with a 404', info.tarball)
          callbackDone = true
          report[info.tarball] = info
          delete counter[info.path]
          writer.end()
          req.abort()
          return callback(new Error('failed to download ' + info.tarball))
        }
        res.on('end', function () {
          if (callbackDone) {
            return
          }
          log('[' + counter[info.path] + '] finished downloading', url, 'in', timethat(startDL))
          process.nextTick(function () {
            exports.verify(info, callback)
          })
        })
          .pipe(writer)
      })
  })
}

exports.verify = (info, callback) => {
  counter[info.path] = counter[info.path] || 0
  process.nextTick(() => {
    blobStore.exists(info.tarball, (err, good) => {
      if (err) {
        return log.err(err)
      }
      if (!good) {
        return exports.update(info, callback)
      }
      if (counter[info.path] >= 4) {
        report[info.tarball] = info
        log(' [' + counter[info.path] + '] file appears to be corrupt, skipping..', info.tarball)
        delete counter[info.path]
        // bail, the tarball is corrupt
        return callback(null, info)
      }
      log('[' + counter[info.path] + '] checking shasum of', info.tarball)
      process.nextTick(function () {
        hooks.shasumCheck(info, function () {
          // shasum failed
          exports.update(info, callback)
        }, () => {
          // shasum passed
          delete counter[info.path]
          callback(null, info)
        })
      })
    })
  })
}
